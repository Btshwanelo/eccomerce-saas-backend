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

// Schema for product variants (size/color combinations with quantities)
const productVariantSchema = new mongoose.Schema({
  sku: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
  attributes: [productAttributeSchema], // Size, color, etc.
  quantity: { type: Number, default: 0 },
  price: { type: Number }, // Optional: variant-specific pricing
  salePrice: { type: Number }, // Optional: variant-specific sale pricing
  images: [{
    id: String,
    filename: String,
    downloadUrl: String,
    directUrl: String,
    isPrimary: { type: Boolean, default: false },
  }],
  isActive: { type: Boolean, default: true },
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
        "trending",
        "exclusive",
        "new",
        "sale",
        "bestseller",
      ],
    },
  ],

  // Dynamic attributes based on category filters (for simple products)
  attributes: [productAttributeSchema],

  // Product variants for size/color combinations with individual quantities
  variants: [productVariantSchema],

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
