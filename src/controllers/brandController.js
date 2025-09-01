const Brand = require("../models/Brand");

// Create a brand
exports.createBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const brand = new Brand({ name, slug, description });
    await brand.save();
    res.status(201).json({ success: true, brand });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json({ success: true, brands });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand)
      return res.status(404).json({ success: false, error: "Brand not found" });
    res.json({ success: true, brand });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a brand by slug
exports.getBrandBySlug = async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug });
    if (!brand)
      return res.status(404).json({ success: false, error: "Brand not found" });
    res.json({ success: true, brand });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a brand
exports.updateBrand = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    let updateData = { description, isActive };

    // If name is being updated, generate new slug
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updateData.name = name;
      updateData.slug = slug;
    }

    const brand = await Brand.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!brand)
      return res.status(404).json({ success: false, error: "Brand not found" });
    res.json({ success: true, brand });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand)
      return res.status(404).json({ success: false, error: "Brand not found" });
    res.json({ success: true, message: "Brand deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
