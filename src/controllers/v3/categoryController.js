const { CategoryV3 } = require("../../models/v3");
const { uploadFileToStorage, validateImageFile } = require("../../utils/uploadFile");

// Create a category
exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;

    // Generate slug from name
    const slug = categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Handle image upload
    if (req.file) {
      try {
        validateImageFile(req.file);
        const uploadResult = await uploadFileToStorage(req.file);
        categoryData.image = uploadResult.downloadUrl;
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          error: `Failed to upload image: ${uploadError.message}`,
        });
      }
    }

    // Handle parent category and level calculation
    let level = 0;
    let path = slug;
    
    if (categoryData.parentCategory) {
      const parentCategory = await CategoryV3.findById(categoryData.parentCategory);
      if (parentCategory) {
        level = parentCategory.level + 1;
        path = `${parentCategory.path}/${slug}`;
      }
    }

    const category = new CategoryV3({
      ...categoryData,
      slug,
      level,
      path,
    });

    await category.save();
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sort = "sortOrder",
      parentCategory,
      level,
      isActive = true,
      search,
    } = req.query;

    const filter = { isActive };

    if (parentCategory !== undefined) {
      if (parentCategory === null || parentCategory === "null") {
        filter.parentCategory = null;
      } else {
        filter.parentCategory = parentCategory;
      }
    }

    if (level !== undefined) {
      filter.level = Number(level);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const categories = await CategoryV3.find(filter)
      .populate("parentCategory")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await CategoryV3.countDocuments(filter);

    res.json({
      success: true,
      categories,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get category tree (hierarchical structure)
exports.getCategoryTree = async (req, res) => {
  try {
    const { isActive = true } = req.query;

    const categories = await CategoryV3.find({ isActive })
      .populate("parentCategory")
      .sort({ level: 1, sortOrder: 1, name: 1 });

    // Build tree structure
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category._id.toString(), {
        ...category.toObject(),
        children: [],
      });
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      const categoryObj = categoryMap.get(category._id.toString());
      
      if (category.parentCategory) {
        const parent = categoryMap.get(category.parentCategory._id.toString());
        if (parent) {
          parent.children.push(categoryObj);
        }
      } else {
        rootCategories.push(categoryObj);
      }
    });

    res.json({ success: true, categories: rootCategories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await CategoryV3.findById(req.params.id).populate("parentCategory");
    
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    // Get subcategories
    const subcategories = await CategoryV3.find({
      parentCategory: category._id,
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, category, subcategories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await CategoryV3.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("parentCategory");
    
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    // Get subcategories
    const subcategories = await CategoryV3.find({
      parentCategory: category._id,
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, category, subcategories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const categoryId = req.params.id;

    // Handle name change and slug generation
    if (categoryData.name) {
      const slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      categoryData.slug = slug;
    }

    // Handle image upload
    if (req.file) {
      try {
        validateImageFile(req.file);
        const uploadResult = await uploadFileToStorage(req.file);
        categoryData.image = uploadResult.downloadUrl;
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          error: `Failed to upload image: ${uploadError.message}`,
        });
      }
    }

    // Handle parent category change and recalculate level/path
    if (categoryData.parentCategory !== undefined) {
      let level = 0;
      let path = categoryData.slug || (await CategoryV3.findById(categoryId)).slug;
      
      if (categoryData.parentCategory) {
        const parentCategory = await CategoryV3.findById(categoryData.parentCategory);
        if (parentCategory) {
          level = parentCategory.level + 1;
          path = `${parentCategory.path}/${categoryData.slug || (await CategoryV3.findById(categoryId)).slug}`;
        }
      }

      categoryData.level = level;
      categoryData.path = path;
    }

    const category = await CategoryV3.findByIdAndUpdate(
      categoryId,
      { ...categoryData, updatedAt: Date.now() },
      { new: true }
    ).populate("parentCategory");

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await CategoryV3.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    // Check if category has subcategories
    const subcategories = await CategoryV3.find({ parentCategory: category._id });
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete category with subcategories. Please delete subcategories first.",
      });
    }

    await CategoryV3.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get category breadcrumb
exports.getCategoryBreadcrumb = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const breadcrumb = [];
    
    let currentCategory = await CategoryV3.findById(categoryId).populate("parentCategory");
    
    while (currentCategory) {
      breadcrumb.unshift({
        _id: currentCategory._id,
        name: currentCategory.name,
        slug: currentCategory.slug,
        level: currentCategory.level,
      });
      
      if (currentCategory.parentCategory) {
        currentCategory = await CategoryV3.findById(currentCategory.parentCategory._id).populate("parentCategory");
      } else {
        currentCategory = null;
      }
    }

    res.json({ success: true, breadcrumb });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

