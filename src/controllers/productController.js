// controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// Create a product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, subcategory } = req.body;
    
    // Handle uploaded files
    let images = [];
    if (req.files && req.files.length > 0) {
      // Process each uploaded file
      for (const file of req.files) {
        try {
          // Upload file to external storage
          const uploadResult = await uploadFileToStorage(file);
          images.push(uploadResult);
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          return res.status(400).json({ 
            success: false, 
            error: `Failed to upload file ${file.originalname}: ${uploadError.message}` 
          });
        }
      }
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

// Helper function to upload file to external storage
async function uploadFileToStorage(file) {
  const FormData = require('form-data');
  const axios = require('axios');
  
  const form = new FormData();
  form.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype
  });

  try {
    const response = await axios.post('http://localhost:4000/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    return response.data.file;
  } catch (error) {
    console.error('File upload failed:', error.response?.data || error.message);
    throw new Error('Failed to upload file to storage');
  }
}

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
    
    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        try {
          const uploadResult = await uploadFileToStorage(file);
          newImages.push(uploadResult);
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          return res.status(400).json({ 
            success: false, 
            error: `Failed to upload file ${file.originalname}: ${uploadError.message}` 
          });
        }
      }
      update.images = newImages;
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