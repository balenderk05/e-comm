// models/Cart.js
const mongoose = require('mongoose');

// Cart schema to store cart items
const cartItemSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model

  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartItemSchema);

module.exports = Cart;
