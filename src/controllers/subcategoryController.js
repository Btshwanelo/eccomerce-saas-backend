const Subcategory = require('../models/Subcategory');

// Create a subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const subcategory = new Subcategory({ name, category, description });
    await subcategory.save();
    res.status(201).json({ success: true, subcategory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all subcategories
exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate('category');
    res.json({ success: true, subcategories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a subcategory by ID
exports.getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate('category');
    if (!subcategory) return res.status(404).json({ success: false, error: 'Subcategory not found' });
    res.json({ success: true, subcategory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      { name, category, description },
      { new: true }
    );
    if (!subcategory) return res.status(404).json({ success: false, error: 'Subcategory not found' });
    res.json({ success: true, subcategory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) return res.status(404).json({ success: false, error: 'Subcategory not found' });
    res.json({ success: true, message: 'Subcategory deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 