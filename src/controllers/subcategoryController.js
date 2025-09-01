const Subcategory = require("../models/Subcategory");

// Create a subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const subcategory = new Subcategory({ name, slug, category, description });
    await subcategory.save();
    res.status(201).json({ success: true, subcategory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all subcategories
exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ isActive: true })
      .populate("category")
      .sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, subcategories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a subcategory by ID
exports.getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate(
      "category"
    );
    if (!subcategory)
      return res
        .status(404)
        .json({ success: false, error: "Subcategory not found" });
    res.json({ success: true, subcategory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a subcategory by slug
exports.getSubcategoryBySlug = async (req, res) => {
  try {
    const subcategory = await Subcategory.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("category");
    if (!subcategory)
      return res
        .status(404)
        .json({ success: false, error: "Subcategory not found" });
    res.json({ success: true, subcategory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get subcategories by category
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({
      category: categoryId,
      isActive: true,
    })
      .populate("category")
      .sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, subcategories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get subcategories by category slug
exports.getSubcategoriesByCategorySlug = async (req, res) => {
  try {
    const Category = require("../models/Category");
    const { categorySlug } = req.params;

    const category = await Category.findOne({
      slug: categorySlug,
      isActive: true,
    });
    if (!category)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });

    const subcategories = await Subcategory.find({
      category: category._id,
      isActive: true,
    })
      .populate("category")
      .sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, subcategories, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const { name, category, description, isActive, sortOrder } = req.body;

    let updateData = { category, description, isActive, sortOrder };

    // If name is being updated, generate new slug
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updateData.name = name;
      updateData.slug = slug;
    }

    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("category");

    if (!subcategory)
      return res
        .status(404)
        .json({ success: false, error: "Subcategory not found" });
    res.json({ success: true, subcategory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory)
      return res
        .status(404)
        .json({ success: false, error: "Subcategory not found" });
    res.json({ success: true, message: "Subcategory deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get subcategory product count
exports.getSubcategoryProductCount = async (req, res) => {
  try {
    const Product = require("../models/Product");

    const subcategory = await Subcategory.findById(req.params.id).populate(
      "category"
    );
    if (!subcategory)
      return res
        .status(404)
        .json({ success: false, error: "Subcategory not found" });

    const productCount = await Product.countDocuments({
      subcategory: subcategory._id,
      status: "active",
    });

    res.json({ success: true, subcategory, productCount });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
