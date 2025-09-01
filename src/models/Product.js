const mongoose = require("mongoose");

const productAttributeSchema = new mongoose.Schema({
  filter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Filter",
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  displayValue: { type: String },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: { type: String },
  price: {
    type: Number,
    required: true,
  },
  salePrice: { type: Number },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },

  status: {
    type: String,
    enum: ["active", "inactive", "draft", "out_of_stock"],
    default: "active",
  },

  tags: [
    {
      type: String,
      enum: [
        "coming_soon",
        "just_dropped",
        "trending",
        "exclusive",
        "new_in",
        "sale",
        "bestseller",
      ],
    },
  ],

  // Dynamic attributes based on category filters
  attributes: [productAttributeSchema],

  // Category-specific fields stored as flexible object
  specificFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  inventory: {
    quantity: { type: Number, default: 0 },
    trackQuantity: { type: Boolean, default: true },
  },

  images: [
    {
      id: String,
      filename: String,
      downloadUrl: String,
      directUrl: String,
      isPrimary: { type: Boolean, default: false },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
