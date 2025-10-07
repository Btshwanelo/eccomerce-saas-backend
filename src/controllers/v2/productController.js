const {
  ProductV2,
  ProductVariantV2,
  CategoryV2,
  BrandV2,
  ColorV2,
  SizeV2,
  MaterialV2,
  GenderV2,
  SeasonV2,
  StyleV2,
  PatternV2,
  ShoeHeightV2,
  FitV2,
  OccasionV2,
  CollarTypeV2,
} = require("../../models/v2");

const { uploadFileToStorage, validateImageFile } = require("../../utils/uploadFile");

// Helper function to build filter query
function buildProductFilter(query) {
  const filter = {};

  // Basic filters
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.brandId) filter.brandId = query.brandId;
  if (query.genderId) filter.genderId = query.genderId;
  if (query.seasonId) filter.seasonId = query.seasonId;
  if (query.styleId) filter.styleId = query.styleId;
  if (query.patternId) filter.patternId = query.patternId;
  if (query.shoeHeightId) filter.shoeHeightId = query.shoeHeightId;
  if (query.fitId) filter.fitId = query.fitId;
  if (query.collarTypeId) filter.collarTypeId = query.collarTypeId;

  // Array filters
  if (query.materialIds) {
    filter.materialIds = {
      $in: Array.isArray(query.materialIds)
        ? query.materialIds
        : [query.materialIds],
    };
  }
  if (query.occasionIds) {
    filter.occasionIds = {
      $in: Array.isArray(query.occasionIds)
        ? query.occasionIds
        : [query.occasionIds],
    };
  }

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

  // Product type
  if (query.productType) filter.productType = query.productType;

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

// Helper function to get available filters for a category
async function getAvailableFilters(categoryId, baseFilter = {}) {
  const filters = {};

  // Get all attribute models
  const attributeModels = {
    brands: BrandV2,
    colors: ColorV2,
    sizes: SizeV2,
    materials: MaterialV2,
    genders: GenderV2,
    seasons: SeasonV2,
    styles: StyleV2,
    patterns: PatternV2,
    shoeHeights: ShoeHeightV2,
    fits: FitV2,
    occasions: OccasionV2,
    collarTypes: CollarTypeV2,
  };

  // Get counts for each attribute
  for (const [key, Model] of Object.entries(attributeModels)) {
    const items = await Model.find({ isActive: true }).sort({
      sortOrder: 1,
      name: 1,
    });

    const itemsWithCounts = await Promise.all(
      items.map(async (item) => {
        const count = await ProductV2.countDocuments({
          ...baseFilter,
          [key === "brands" ? "brandId" : `${key.slice(0, -1)}Id`]: item._id,
        });
        return {
          ...item.toObject(),
          count,
        };
      })
    );

    filters[key] = itemsWithCounts.filter((item) => item.count > 0);
  }

  return filters;
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
          // Validate file before upload
          validateImageFile(file);
          
          const uploadResult = await uploadFileToStorage(file);
          images.push({
            url: uploadResult.downloadUrl, // Use downloadUrl as specified
            alt: file.originalname,
            isPrimary: images.length === 0,
            sortOrder: images.length,
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

    const product = new ProductV2({
      ...productData,
      slug,
      images,
    });

    await product.save();
    await product.populate([
      "categoryId",
      "brandId",
      "genderId",
      "seasonId",
      "styleId",
      "materialIds",
      "patternId",
      "shoeHeightId",
      "fitId",
      "occasionIds",
      "collarTypeId",
      "images.colorId",
    ]);

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
    const products = await ProductV2.find(filter)
      .populate([
        "categoryId",
        "brandId",
        "genderId",
        "seasonId",
        "styleId",
        "materialIds",
        "patternId",
        "shoeHeightId",
        "fitId",
        "occasionIds",
        "collarTypeId",
        "images.colorId",
      ])
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await ProductV2.countDocuments(filter);

    // Get available filters for the current category
    let availableFilters = {};
    if (queryParams.categoryId) {
      availableFilters = await getAvailableFilters(
        queryParams.categoryId,
        filter
      );
    }

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      filters: availableFilters,
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

    // Get products
    const products = await ProductV2.find(filter)
      .populate([
        "categoryId",
        "brandId",
        "genderId",
        "seasonId",
        "styleId",
        "materialIds",
        "patternId",
        "shoeHeightId",
        "fitId",
        "occasionIds",
        "collarTypeId",
        "images.colorId",
      ])
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await ProductV2.countDocuments(filter);

    // Get search suggestions
    const suggestions = await ProductV2.aggregate([
      { $match: { status: "published", visibility: "public" } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categoryv2s",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: { name: "$category.name", slug: "$category.slug", count: 1 },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      suggestions,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await ProductV2.findById(req.params.id).populate([
      "categoryId",
      "brandId",
      "genderId",
      "seasonId",
      "styleId",
      "materialIds",
      "patternId",
      "shoeHeightId",
      "fitId",
      "occasionIds",
      "collarTypeId",
      "images.colorId",
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
    const relatedProducts = await ProductV2.find({
      _id: { $ne: product._id },
      categoryId: product.categoryId,
      status: "published",
      visibility: "public",
    })
      .populate(["categoryId", "brandId", "images.colorId"])
      .limit(4);

    res.json({ success: true, product, relatedProducts });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await ProductV2.findOne({
      slug: req.params.slug,
      status: "published",
      visibility: "public",
    }).populate([
      "categoryId",
      "brandId",
      "genderId",
      "seasonId",
      "styleId",
      "materialIds",
      "patternId",
      "shoeHeightId",
      "fitId",
      "occasionIds",
      "collarTypeId",
      "images.colorId",
    ]);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Increment views
    product.views += 1;
    await product.save();

    // Get product variants if it's a variable product
    let variants = [];
    if (product.productType === "variable") {
      variants = await ProductVariantV2.find({
        productId: product._id,
        isActive: true,
      }).populate(["colorId", "sizeId", "genderId"]);
    }

    // Get related products
    const relatedProducts = await ProductV2.find({
      _id: { $ne: product._id },
      categoryId: product.categoryId,
      status: "published",
      visibility: "public",
    })
      .populate(["categoryId", "brandId", "images.colorId"])
      .limit(4);

    res.json({ success: true, product, variants, relatedProducts });
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
      const existingProduct = await ProductV2.findById(productId);
      let existingImages = existingProduct ? existingProduct.images : [];

      for (const file of req.files) {
        try {
          // Validate file before upload
          validateImageFile(file);
          
          const uploadResult = await uploadFileToStorage(file);
          existingImages.push({
            url: uploadResult.downloadUrl, // Use downloadUrl as specified
            alt: file.originalname,
            isPrimary: false,
            sortOrder: existingImages.length,
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

    const product = await ProductV2.findByIdAndUpdate(
      productId,
      { ...productData, updatedAt: Date.now() },
      { new: true }
    ).populate([
      "categoryId",
      "brandId",
      "genderId",
      "seasonId",
      "styleId",
      "materialIds",
      "patternId",
      "shoeHeightId",
      "fitId",
      "occasionIds",
      "collarTypeId",
      "images.colorId",
    ]);

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
    const product = await ProductV2.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Also delete associated variants
    await ProductVariantV2.deleteMany({ productId: product._id });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get product variants
exports.getProductVariants = async (req, res) => {
  try {
    const variants = await ProductVariantV2.find({
      productId: req.params.productId,
      isActive: true,
    }).populate(["colorId", "sizeId", "genderId"]);

    res.json({ success: true, variants });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Create product variant
exports.createProductVariant = async (req, res) => {
  try {
    const variantData = {
      ...req.body,
      productId: req.params.productId,
    };

    // Handle uploaded files for variant
    let variantImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // Validate file before upload
          validateImageFile(file);
          
          const uploadResult = await uploadFileToStorage(file);
          variantImages.push({
            url: uploadResult.downloadUrl,
            alt: file.originalname,
            isPrimary: variantImages.length === 0,
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

    // Add images to variant data if any were uploaded
    if (variantImages.length > 0) {
      variantData.images = variantImages;
    }

    const variant = new ProductVariantV2(variantData);
    await variant.save();
    await variant.populate(["colorId", "sizeId", "genderId"]);

    res.status(201).json({ success: true, variant });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update product variant
exports.updateProductVariant = async (req, res) => {
  try {
    const variantData = { ...req.body };

    // Handle new uploaded files for variant
    if (req.files && req.files.length > 0) {
      const existingVariant = await ProductVariantV2.findById(req.params.variantId);
      let existingImages = existingVariant ? existingVariant.images : [];

      for (const file of req.files) {
        try {
          // Validate file before upload
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

      variantData.images = existingImages;
    }

    const variant = await ProductVariantV2.findByIdAndUpdate(
      req.params.variantId,
      variantData,
      { new: true }
    ).populate(["colorId", "sizeId", "genderId"]);

    if (!variant) {
      return res
        .status(404)
        .json({ success: false, error: "Variant not found" });
    }

    res.json({ success: true, variant });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete product variant
exports.deleteProductVariant = async (req, res) => {
  try {
    const variant = await ProductVariantV2.findByIdAndDelete(
      req.params.variantId
    );
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, error: "Variant not found" });
    }

    res.json({ success: true, message: "Variant deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get filter options for a category
exports.getFilterOptions = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { ...queryParams } = req.query;

    const baseFilter = buildProductFilter(queryParams);
    const filters = await getAvailableFilters(categoryId, baseFilter);

    res.json({ success: true, filters });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get trending products
exports.getTrendingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await ProductV2.find({
      status: "published",
      visibility: "public",
      salesCount: { $gt: 0 },
    })
      .populate(["categoryId", "brandId", "images.colorId"])
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

    const products = await ProductV2.find({
      status: "published",
      visibility: "public",
      createdAt: { $gte: thirtyDaysAgo },
    })
      .populate(["categoryId", "brandId", "images.colorId"])
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, products });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

