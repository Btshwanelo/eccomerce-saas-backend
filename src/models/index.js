const mongoose = require("mongoose");

// Brand Schema


// Filter Group Schema - Groups filters by category


// Filter Schema - Individual filters within groups


// Export models
module.exports = {
  User: mongoose.model("User", userSchema),
  Brand: mongoose.model("Brand", brandSchema),
  Category: mongoose.model("Category", categorySchema),
  Subcategory: mongoose.model("Subcategory", subcategorySchema),
  FilterGroup: mongoose.model("FilterGroup", filterGroupSchema),
  Filter: mongoose.model("Filter", filterSchema),
  Product: mongoose.model("Product", productSchema),
  Cart: mongoose.model("Cart", cartSchema),
  Address: mongoose.model("Address", addressSchema),
  DeliveryOption: mongoose.model("DeliveryOption", deliveryOptionSchema),
  Order: mongoose.model("Order", orderSchema),
  Payment: mongoose.model("Payment", paymentSchema),
};
