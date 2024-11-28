const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     required: true 
    },
  cartItems: [
    {
      product: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: 'Product', 
         required: true 
        },
      quantity: { 
        type: Number,
         required: true 
        },
      price: { 
        type: Number,
         required: true
         },
    },
  ],
  totalAmount: {
     type: Number,
      required: true 
    },
  paymentMethod: {
     type: String,
      enum: ['online', 'cash_on_delivery'],
       required: true 
    },
  status: {
     type: String,
      enum: ['pending', 'completed', 'cancelled'],
       default: 'pending'
     },
  createdAt:
   { type: Date, 
    default: Date.now 
},
});





module.exports = mongoose.model('Order', orderSchema);
