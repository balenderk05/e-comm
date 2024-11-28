// routes/auth.js
require('dotenv').config();
const express = require('express');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Category = require('../models/categoryModel'); 
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const Cart= require('../models/cartModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();


// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if the user already exists
  const userExists = await User.findByEmail(email);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
 }  
  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);


  // Create new user
  const user = new User({
    username,
    email,
    password,
    role: role || 'user', // Default to 'user' if no role provided
  });

  try {
    await user.save();
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        username: user.username,
        email: user.email,
        role: user.role
       
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// routes/auth.js (continuation)

const bcrypt = require('bcrypt');

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(400).json({ message: 'please login with correct email' });
  }

  // Check if the password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  // Create JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, 'JWT_SECRET', { expiresIn: '1h' });

  res.json({
    message: 'Login successful',
    token,
  });
});

// Search products by different criteria
router.get('/search', async (req, res) => {
  try {
    const { name, description, category, minPrice, maxPrice, quantity } = req.query;

    let searchQuery = {};

    // Check for name
    if (name) {
      searchQuery.name = { $regex: name, $options: 'i' }; // case-insensitive search
    }

    // Check for description
    if (description) {
      searchQuery.description = { $regex: description, $options: 'i' };
    }

    // Check for category
    if (category) {
      const categoryObjectId = mongoose.Types.ObjectId(category);
      searchQuery.category = categoryObjectId;
    }

     // Check for price range
     if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = minPrice;
      if (maxPrice) searchQuery.price.$lte = maxPrice;
    }

    // Check for quantity
    if (quantity) {
      searchQuery.quantity = { $gte: quantity };
    }

    // Execute search
    const products = await Product.find(searchQuery)
      .populate('category', 'name') // populate category name if you want to display it
      .exec();

    res.status(200).json(products);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});



// Route to get all products
router.get('/products', async (req, res) => {
  try {
    // Fetch products from the database, populate the category field with category details
    const products = await Product.find().populate('category', 'name'); // 'name' will be included from the category model
    res.json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to get a single product by its ID
router.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




// Add product to cart
router.post('/add-to-cart/:productId', async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than 0.' });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if there's enough stock
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available.' });
    }

    // Add the product to the cart
    const cartItem = await Cart.findOne({ product: productId });
    if (cartItem) {
      // Update existing cart item if it already exists
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create a new cart item if it doesn't exist
      await Cart.create({ product: productId, quantity });
    }

    // Reduce the product quantity in the product list
    product.quantity -= quantity;
    await product.save();

    res.status(200).json({ message: 'Product added to cart successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View the cart
router.get('/cart', async (req, res) => {
  try {
    const cartItems = await Cart.find().populate('product');
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Checkout (optional - for simplicity, assume cart is cleared after checkout)
//  router.post('/checkout', async (req, res) => {
//   try {
//     const cartItems = await Cart.find().populate('product');
//     let total = 0;

//     cartItems.forEach(item => {
//       total += item.product.price * item.quantity;
//     });

//     // Assuming checkout is successful, empty the cart
//     await Cart.deleteMany({});
//     res.json({ message: 'Checkout successful!', total });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });







// Checkout route with payment options
router.post('/pay', async (req, res) => {
  try {
    const { paymentMethod } = req.body; // Either "online" or "cash_on_delivery"
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Fetch the cart items
    const cartItems = await Cart.find().populate('product');
    
    // Calculate the total cost
    let total = 0;
    cartItems.forEach(item => {
      total += item.product.price * item.quantity;
    });

    if (paymentMethod === 'online') {
      // Process online payment (Here, we're simulating the payment)
      // In a real-world scenario, you would integrate with a payment gateway such as Stripe, PayPal, etc.



      // Example with Stripe (you would send the payment intent client-side)
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: total * 100, // Amount in cents
      //   currency: 'usd', // Or any other currency
      //   payment_method_types: ['card'],
      // });



      // Send the payment intent client secret to the client for frontend payment processing
       res.json({
        message: 'Payment processing started.',
        // clientSecret: paymentIntent.client_secret, // Frontend needs to handle the payment with Stripe.js
      });

    } else if (paymentMethod === 'cash_on_delivery') {
      // Simulate Cash on Delivery: Assume order is placed, and no actual payment is needed right now.
      // You could also add a status field to track whether the payment is completed later

      // Empty the cart (Order confirmed)
      await Cart.deleteMany({});
      
      res.json({
        message: 'Order confirmed! Pay at delivery.',
        total,
      });
      
    } else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during checkout', error: err.message });
  }
});


module.exports = router;
