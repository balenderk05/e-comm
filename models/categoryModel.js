// models/Category.js
const mongoose = require('mongoose');

// Define Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
