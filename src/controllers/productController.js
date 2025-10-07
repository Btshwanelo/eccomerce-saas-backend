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
      variants, // New: variants array
      specificFields,
      inventory,
    } = req.body;
    console.log("Request body:", req.body);
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

    // Parse attributes JSON string if it exists
    let parsedAttributes = [];
    if (attributes) {
      try {
        parsedAttributes =
          typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch (parseError) {
        console.error("Attributes parse error:", parseError);
        return res.status(400).json({
          success: false,
          error: "Invalid JSON format for attributes field",
        });
      }
    }

    // Parse and process variants
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants =
          typeof variants === "string" ? JSON.parse(variants) : variants;

        // Generate SKUs for variants if not provided
        parsedVariants = parsedVariants.map((variant, index) => ({
          ...variant,
          sku: variant.sku || `${slug}-variant-${index + 1}`,
          isActive: variant.isActive !== undefined ? variant.isActive : true,
        }));
      } catch (parseError) {
        console.error("Variants parse error:", parseError);
        return res.status(400).json({
          success: false,
          error: "Invalid JSON format for variants field",
        });
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
      attributes: parsedAttributes,
      variants: parsedVariants,
      specificFields: specificFields || {},
      inventory: inventory || { quantity: 0, trackQuantity: true },
      images,
    });

    await product.save();
    await product.populate([
      "category",
      "subcategory",
      "brand",
      "attributes.filter",
      "variants.attributes.filter",
    ]);

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
      // Dynamic attribute filters using filter IDs
      ...otherParams
    } = req.query;

    console.log("Query params:", req.query);
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

    // Handle attribute-based filters using filter IDs
    const attributeFilters = [];
    const knownParams = [
      "page",
      "limit",
      "sort",
      "category",
      "subcategory",
      "brand",
      "minPrice",
      "maxPrice",
      "status",
      "tags",
      "search",
    ];

    // Get all active filters to validate filter IDs
    const Filter = require("../models/Filter");
    const allFilters = await Filter.find({ isActive: true });
    const validFilterIds = new Set(allFilters.map((f) => f._id.toString()));

    // Process attribute filters from query params
    for (const [key, value] of Object.entries(otherParams)) {
      // Skip known non-attribute parameters
      if (knownParams.includes(key)) {
        continue;
      }

      // Check if this key is a valid filter ID
      if (validFilterIds.has(key)) {
        const filterId = key;
        const values = Array.isArray(value) ? value : [value];

        // Add attribute filter condition
        attributeFilters.push({
          filter: filterId,
          value: { $in: values },
        });
      }
    }

    // Add attribute filters to the main filter
    if (attributeFilters.length > 0) {
      filter["attributes"] = {
        $all: attributeFilters.map((attrFilter) => ({
          $elemMatch: attrFilter,
        })),
      };
    }

    // Get available filters for the category
    let availableFilters = [];
    if (category) {
      const FilterGroup = require("../models/FilterGroup");

      // Find filter groups for this category
      const filterGroups = await FilterGroup.find({
        category: category,
        isActive: true,
      }).sort({ sortOrder: 1 });

      if (filterGroups.length > 0) {
        const filterGroupIds = filterGroups.map((group) => group._id);

        // Find all active filters for these filter groups
        const filters = await Filter.find({
          filterGroup: { $in: filterGroupIds },
          isActive: true,
        })
          .populate("filterGroup", "name slug")
          .sort({ sortOrder: 1 });

        // Get product counts for each filter option
        for (const filterDoc of filters) {
          const filterWithCounts = filterDoc.toObject();

          // Update option counts based on actual products
          for (const option of filterWithCounts.options) {
            const productCount = await Product.countDocuments({
              ...filter,
              attributes: {
                $elemMatch: {
                  filter: filterDoc._id,
                  value: option.value,
                },
              },
            });
            option.count = productCount;
          }

          availableFilters.push(filterWithCounts);
        }
      }
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
      filters: availableFilters,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// Get products with trending and new tags
exports.getCategoryProducts = async (req, res) => {
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
      search,
    } = req.query;

    // Base filter for all products
    const baseFilter = { status };

    if (category) baseFilter.category = category;
    if (subcategory) baseFilter.subcategory = subcategory;
    if (brand) baseFilter.brand = brand;

    if (minPrice || maxPrice) {
      baseFilter.price = {};
      if (minPrice) baseFilter.price.$gte = Number(minPrice);
      if (maxPrice) baseFilter.price.$lte = Number(maxPrice);
    }

    if (search) {
      baseFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Create separate filters for trending and new products
    const trendingFilter = {
      ...baseFilter,
      tags: { $in: ["trending"] },
    };

    const newFilter = {
      ...baseFilter,
      tags: { $in: ["new"] },
    };

    // Execute both queries concurrently
    const [trendingProducts, newProducts] = await Promise.all([
      Product.find(trendingFilter)
        .populate(["category", "subcategory", "brand"])
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),

      Product.find(newFilter)
        .populate(["category", "subcategory", "brand"])
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
    ]);

    // Get total counts for pagination
    const [trendingTotal, newTotal] = await Promise.all([
      Product.countDocuments(trendingFilter),
      Product.countDocuments(newFilter),
    ]);

    const totalProducts = trendingTotal + newTotal;

    res.json({
      success: true,
      products: {
        new: newProducts,
        trending: trendingProducts,
      },
      total: totalProducts,
      counts: {
        new: newTotal,
        trending: trendingTotal,
      },
      page: Number(page),
      pages: Math.ceil(totalProducts / limit),
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
      variants,
      specificFields,
      inventory,
      existingImages,
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

    // Parse and process variants
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants =
          typeof variants === "string" ? JSON.parse(variants) : variants;

        // Generate SKUs for variants if not provided
        parsedVariants = parsedVariants.map((variant, index) => ({
          ...variant,
          sku:
            variant.sku ||
            `${updateData.slug || "product"}-variant-${index + 1}`,
          isActive: variant.isActive !== undefined ? variant.isActive : true,
        }));
        updateData.variants = parsedVariants;
      } catch (parseError) {
        console.error("Variants parse error:", parseError);
        return res.status(400).json({
          success: false,
          error: "Invalid JSON format for variants field",
        });
      }
    }

    // Handle existing images
    let allImages = [];
    if (existingImages) {
      try {
        const parsedExistingImages =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;
        allImages = [...parsedExistingImages];
      } catch (parseError) {
        console.error("Existing images parse error:", parseError);
      }
    }

    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadResult = await uploadFileToStorage(file);
          allImages.push({
            id:
              uploadResult.id ||
              `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            filename: uploadResult.filename,
            downloadUrl: uploadResult.downloadUrl,
            directUrl: uploadResult.directUrl,
            isPrimary: allImages.length === 1, // First image is primary
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

    // Update images if we have any
    if (allImages.length > 0) {
      updateData.images = allImages;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate([
      "category",
      "subcategory",
      "brand",
      "attributes.filter",
      "variants.attributes.filter",
    ]);
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
