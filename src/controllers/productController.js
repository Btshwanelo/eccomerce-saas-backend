const Product = require("../models/Product");

// Helper function to upload file to external storage
async function uploadFileToStorage(file) {
  const FormData = require("form-data");
  const axios = require("axios");

  const form = new FormData();
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  try {
    const response = await axios.post("http://localhost:4000/upload", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return response.data.file;
  } catch (error) {
    console.error("File upload failed:", error.response?.data || error.message);
    throw new Error("Failed to upload file to storage");
  }
}

// Create a product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      category,
      subcategory,
      brand,
      tags,
      attributes,
      specificFields,
      inventory,
    } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Handle uploaded files
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadResult = await uploadFileToStorage(file);
          images.push({
            id:
              uploadResult.id ||
              `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            filename: uploadResult.filename,
            downloadUrl: uploadResult.downloadUrl,
            directUrl: uploadResult.directUrl,
            isPrimary: images.length === 0, // First image is primary
          });
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          return res.status(400).json({
            success: false,
            error: `Failed to upload file ${file.originalname}: ${uploadError.message}`,
          });
        }
      }
    }

    const product = new Product({
      name,
      slug,
      description,
      price,
      salePrice,
      category,
      subcategory,
      brand,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      attributes: attributes || [],
      specificFields: specificFields || {},
      inventory: inventory || { quantity: 0, trackQuantity: true },
      images,
    });

    await product.save();
    await product.populate(["category", "subcategory", "brand"]);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      status = "active",
      tags,
      search,
    } = req.query;

    const filter = { status };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = brand;
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate(["category", "subcategory", "brand"])
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate([
      "category",
      "subcategory",
      "brand",
      "attributes.filter",
    ]);
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    // Increment views
    product.views += 1;
    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: "active",
    }).populate(["category", "subcategory", "brand", "attributes.filter"]);
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    // Increment views
    product.views += 1;
    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      category,
      subcategory,
      brand,
      status,
      tags,
      attributes,
      specificFields,
      inventory,
    } = req.body;

    let updateData = {
      description,
      price,
      salePrice,
      category,
      subcategory,
      brand,
      status,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
      attributes: attributes || undefined,
      specificFields: specificFields || undefined,
      inventory: inventory || undefined,
      updatedAt: Date.now(),
    };

    // If name is being updated, generate new slug
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updateData.name = name;
      updateData.slug = slug;
    }

    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        try {
          const uploadResult = await uploadFileToStorage(file);
          newImages.push({
            id:
              uploadResult.id ||
              `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            filename: uploadResult.filename,
            downloadUrl: uploadResult.downloadUrl,
            directUrl: uploadResult.directUrl,
            isPrimary: newImages.length === 0,
          });
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          return res.status(400).json({
            success: false,
            error: `Failed to upload file ${file.originalname}: ${uploadError.message}`,
          });
        }
      }
      updateData.images = newImages;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate(["category", "subcategory", "brand", "attributes.filter"]);
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
