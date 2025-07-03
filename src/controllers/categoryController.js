// controllers/categoryController.js
const Category = require('../models/Category');

// Create a category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 