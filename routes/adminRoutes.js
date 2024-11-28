// routes/admin.js

const express = require('express');
const { protect, isAdmin, protectt, adminAuth } = require('./../middleware');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const router = express.Router();

const Cart = require('../models/cartModel');






// Example admin route
router.get('/dashboard', protect, isAdmin, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard' });
});



// Add Category - Only Admin can add categories
router.post('/category/add', protectt, async (req, res) => {
  try {
    // Check if the user is an admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to add categories' });
    }

    // Create the category
    const { name, description } = req.body;
    const newCategory = new Category({
      name,
      description
    });

    await newCategory.save();
    res.status(201).json({ message: 'Category added successfully', category: newCategory });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to add a new product (only accessible by admin)
router.post('/add/product', async (req, res) => {
  const { name, description, price, category, quantity } = req.body;

  try {
    // Check if the category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).send({ error: 'Category not found.' });
    }

    // Create a new product
    const product = new Product({
      name,
      description,
      price,
      category,
      quantity
    });

    await product.save();
    res.status(201).send(product);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});




// // MANAGE ORDER  


// // View all orders (Admin only)
// router.get('/orders', async (req, res) => {
//   try {
//     const orders = await Order.find().populate('user', 'username email').populate('cartItems.product', 'name price');
//     res.json({ success: true, orders });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// });

// // View a specific order by its ID (Admin only)
// router.get('/order/:id', adminAuth, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const order = await Order.findById(id).populate('user', 'username email').populate('cartItems.product', 'name price');
//     if (!order) {
//       return res.status(404).json({ success: false, message: 'Order not found' });
//     }
//     res.json({ success: true, order });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// });

// // Update the status of an order (Admin only)
// router.put('/order/:id/status', adminAuth, async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body; // Status can be 'pending', 'completed', or 'cancelled'
  
//   if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
//     return res.status(400).json({ message: 'Invalid status' });
//   }

//   try {
//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     order.status = status;
//     await order.save();

//     res.json({ message: 'Order status updated successfully', order });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error updating order status', error: err.message });
//   }
// });

// // Delete an order (Admin only)
// router.delete('/order/:id', adminAuth, async (req, res) => {
//   const { id } = req.params;

//   try {
//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     await order.remove();
//     res.json({ message: 'Order deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error deleting order', error: err.message });
//   }
// });


module.exports = router;
