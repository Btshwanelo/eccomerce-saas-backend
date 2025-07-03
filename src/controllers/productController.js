// controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// Create a product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, subcategory } = req.body;
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({ data: file.buffer, contentType: file.mimetype }));
    }
    const product = new Product({
      name,
      description,
      price,
      category,
      subcategory,
      images
    });
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all products with filter, sort, pagination
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', category, subcategory, minPrice, maxPrice, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (search) filter.name = { $regex: search, $options: 'i' };
    const products = await Product.find(filter)
      .populate('category')
      .populate('subcategory')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);
    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('subcategory');
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, subcategory } = req.body;
    let update = { name, description, price, category, subcategory };
    if (req.files && req.files.length > 0) {
      update.images = req.files.map(file => ({ data: file.buffer, contentType: file.mimetype }));
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 