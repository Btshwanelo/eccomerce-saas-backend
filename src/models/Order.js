const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],

  total: { type: Number, required: true },

  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  deliveryOption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryOption",
    required: true,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },

  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema); 