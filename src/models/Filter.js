const mongoose = require("mongoose");

const filterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["select", "multi-select"],
    required: true,
  },

  // Predefined options for select/multi-select filters
  options: [
    {
      label: { type: String, required: true },
      value: { type: String, required: true },
      count: { type: Number, default: 0 },
    },
  ],

  // For range filters
  //   rangeConfig: {
  //     min: { type: Number },
  //     max: { type: Number },
  //     step: { type: Number, default: 1 },
  //     unit: { type: String }, // e.g., "cm", "kg", "pages"
  //     prefix: { type: String }, // e.g., "R", "$"
  //     suffix: { type: String }, // e.g., "cm", "kg"
  //   },

  filterGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FilterGroup",
    required: true,
  },

  // Global filters apply to all categories
  isGlobal: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Filter", filterSchema);
