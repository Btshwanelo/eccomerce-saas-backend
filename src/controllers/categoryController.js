const Category = require("../models/Category");

// Create a category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, categoryType } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = new Category({ name, slug, description, categoryType });
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      sortOrder: 1,
      name: 1,
    });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!category)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get categories by type
exports.getCategoriesByType = async (req, res) => {
  try {
    const { categoryType } = req.params;
    const categories = await Category.find({
      categoryType,
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, categoryType, isActive, sortOrder } = req.body;

    let updateData = { description, categoryType, isActive, sortOrder };

    // If name is being updated, generate new slug
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updateData.name = name;
      updateData.slug = slug;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!category)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get category with subcategories
exports.getCategoryWithSubcategories = async (req, res) => {
  try {
    const Subcategory = require("../models/Subcategory");

    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!category)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });

    const subcategories = await Subcategory.find({
      category: category._id,
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        subcategories,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get category product count
exports.getCategoryProductCount = async (req, res) => {
  try {
    const Product = require("../models/Product");

    const category = await Category.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });

    const productCount = await Product.countDocuments({
      category: category._id,
      status: "active",
    });

    res.json({ success: true, category, productCount });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
