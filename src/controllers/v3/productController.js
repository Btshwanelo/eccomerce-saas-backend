const {
  ProductV3,
  CategoryV3,
  BrandV3,
} = require("../../models/v3");

const {
  uploadFileToStorage,
  validateImageFile,
} = require("../../utils/uploadFile");

// Helper function to build filter query
function buildProductFilter(query) {
  const filter = {};

  // Basic filters
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.brandId) filter.brandId = query.brandId;
  if (query.gender) filter.gender = query.gender;

  // Price range
  if (query.minPrice || query.maxPrice) {
    filter["pricing.basePrice"] = {};
    if (query.minPrice)
      filter["pricing.basePrice"].$gte = Number(query.minPrice);
    if (query.maxPrice)
      filter["pricing.basePrice"].$lte = Number(query.maxPrice);
  }

  // Stock status
  if (query.stockStatus) {
    filter["inventory.stockStatus"] = query.stockStatus;
  }

  // Status and visibility
  filter.status = query.status || "published";
  filter.visibility = query.visibility || "public";

  // Search
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { shortDescription: { $regex: query.search, $options: "i" } },
      { sku: { $regex: query.search, $options: "i" } },
    ];
  }

  return filter;
}

// Create a product
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Generate slug from name
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Handle uploaded files
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          validateImageFile(file);
          const uploadResult = await uploadFileToStorage(file);
          images.push({
            url: uploadResult.downloadUrl,
            alt: file.originalname,
            isPrimary: images.length === 0,
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

    const product = new ProductV3({
      ...productData,
      slug,
      images,
    });

    await product.save();
    await product.populate(["categoryId", "brandId"]);

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all products with advanced filtering
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      ...queryParams
    } = req.query;

    const filter = buildProductFilter(queryParams);
    const skip = (page - 1) * limit;

    // Get products
    const products = await ProductV3.find(filter)
      .populate(["categoryId", "brandId"])
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await ProductV3.countDocuments(filter);

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

// Get products by category slug/name
exports.getProductsByCategorySlug = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      ...queryParams
    } = req.query;

    const { categorySlug } = req.params;

    // Handle special categories
    let filter = {};
    
    if (categorySlug === 'sales') {
      filter = {
        ...buildProductFilter(queryParams),
        'pricing.salePrice': { $exists: true, $gt: 0 }
      };
    } else if (categorySlug === 'new') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      filter = {
        ...buildProductFilter(queryParams),
        createdAt: { $gte: thirtyDaysAgo }
      };
    } else {
      const category = await CategoryV3.findOne({ slug: categorySlug });
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      filter = buildProductFilter({
        ...queryParams,
        categoryId: category._id
      });
    }

    const skip = (page - 1) * limit;

    const products = await ProductV3.find(filter)
      .populate(["categoryId", "brandId"])
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await ProductV3.countDocuments(filter);

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      category: categorySlug
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get products with advanced search and filtering
exports.searchProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      search,
      ...queryParams
    } = req.query;

    const filter = buildProductFilter({ ...queryParams, search });
    const skip = (page - 1) * limit;

    const products = await ProductV3.find(filter)
      .populate(["categoryId", "brandId"])
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await ProductV3.countDocuments(filter);

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
    const product = await ProductV3.findById(req.params.id).populate([
      "categoryId",
      "brandId",
    ]);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Increment views
    product.views += 1;
    await product.save();

    // Get related products
    const relatedProducts = await ProductV3.find({
      _id: { $ne: product._id },
      categoryId: product.categoryId,
      status: "published",
      visibility: "public",
    })
      .populate(["categoryId", "brandId"])
      .limit(4);

    res.json({ success: true, product, relatedProducts });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await ProductV3.findOne({
      slug: req.params.slug,
      status: "published",
      visibility: "public",
    }).populate(["categoryId", "brandId"]);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Increment views
    product.views += 1;
    await product.save();

    // Get related products
    const relatedProducts = await ProductV3.find({
      _id: { $ne: product._id },
      categoryId: product.categoryId,
      status: "published",
      visibility: "public",
    })
      .populate(["categoryId", "brandId"])
      .limit(4);

    res.json({ success: true, product, relatedProducts });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const productData = req.body;
    const productId = req.params.id;

    // Handle name change and slug generation
    if (productData.name) {
      const slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      productData.slug = slug;
    }

    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      const existingProduct = await ProductV3.findById(productId);
      let existingImages = existingProduct ? existingProduct.images : [];

      for (const file of req.files) {
        try {
          validateImageFile(file);
          const uploadResult = await uploadFileToStorage(file);
          existingImages.push({
            url: uploadResult.downloadUrl,
            alt: file.originalname,
            isPrimary: false,
          });
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          return res.status(400).json({
            success: false,
            error: `Failed to upload file ${file.originalname}: ${uploadError.message}`,
          });
        }
      }

      productData.images = existingImages;
    }

    const product = await ProductV3.findByIdAndUpdate(
      productId,
      { ...productData, updatedAt: Date.now() },
      { new: true }
    ).populate(["categoryId", "brandId"]);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await ProductV3.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get trending products
exports.getTrendingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await ProductV3.find({
      status: "published",
      visibility: "public",
      salesCount: { $gt: 0 },
    })
      .populate(["categoryId", "brandId"])
      .sort({ salesCount: -1, views: -1 })
      .limit(Number(limit));

    res.json({ success: true, products });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get new products
exports.getNewProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const products = await ProductV3.find({
      status: "published",
      visibility: "public",
      createdAt: { $gte: thirtyDaysAgo },
    })
      .populate(["categoryId", "brandId"])
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, products });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

