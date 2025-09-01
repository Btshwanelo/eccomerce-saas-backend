const mongoose = require("mongoose");

const deliveryOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  estimatedDays: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("DeliveryOption", deliveryOptionSchema);
