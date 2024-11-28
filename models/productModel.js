// models/Product.js
const mongoose = require('mongoose');

// Define Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
