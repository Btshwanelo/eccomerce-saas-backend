const mongoose = require('mongoose');

const deliveryOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  estimatedTime: { type: String }
});

module.exports = mongoose.model('DeliveryOption', deliveryOptionSchema); 