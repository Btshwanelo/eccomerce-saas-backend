const Filter = require("../models/Filter");

// Create a filter
exports.createFilter = async (req, res) => {
  try {
    const {
      name,
      type,
      options,
      rangeConfig,
      filterGroup,
      isGlobal,
      isRequired,
    } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const filter = new Filter({
      name,
      slug,
      type,
      options,
      rangeConfig,
      filterGroup,
      isGlobal,
      isRequired,
    });

    await filter.save();
    await filter.populate("filterGroup");
    res.status(201).json({ success: true, filter });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all filters
exports.getFilters = async (req, res) => {
  try {
    const filters = await Filter.find({ isActive: true })
      .populate("filterGroup")
      .sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, filters });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all filters (including inactive) - Admin only
exports.getAllFilters = async (req, res) => {
  try {
    const filters = await Filter.find()
      .populate("filterGroup")
      .sort({ isActive: -1, sortOrder: 1, name: 1 });
    res.json({ success: true, filters });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a filter by ID
exports.getFilterById = async (req, res) => {
  try {
    const filter = await Filter.findById(req.params.id).populate("filterGroup");
    if (!filter) {
      return res
        .status(404)
        .json({ success: false, error: "Filter not found" });
    }
    res.json({ success: true, filter });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a filter by slug
exports.getFilterBySlug = async (req, res) => {
  try {
    const filter = await Filter.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("filterGroup");
    if (!filter) {
      return res
        .status(404)
        .json({ success: false, error: "Filter not found" });
    }
    res.json({ success: true, filter });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get filters by filter group
exports.getFiltersByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const filters = await Filter.find({
      filterGroup: groupId,
      isActive: true,
    })
      .populate("filterGroup")
      .sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, filters });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get filters by filter group slug
exports.getFiltersByGroupSlug = async (req, res) => {
  try {
    const FilterGroup = require("../models/FilterGroup");
    const { groupSlug } = req.params;

    const filterGroup = await FilterGroup.findOne({
      slug: groupSlug,
      isActive: true,
    });
    if (!filterGroup) {
      return res
        .status(404)
        .json({ success: false, error: "Filter group not found" });
    }

    const filters = await Filter.find({
      filterGroup: filterGroup._id,
      isActive: true,
    })
      .populate("filterGroup")
      .sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, filters, filterGroup });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get global filters
exports.getGlobalFilters = async (req, res) => {
  try {
    const filters = await Filter.find({
      isGlobal: true,
      isActive: true,
    })
      .populate("filterGroup")
      .sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, filters });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get filters by category
exports.getFiltersByCategory = async (req, res) => {
  try {
    const FilterGroup = require("../models/FilterGroup");
    const { categoryId } = req.params;

    // Get filter groups for this category
    const filterGroups = await FilterGroup.find({
      category: categoryId,
      isActive: true,
    });

    // Get filters for these groups plus global filters
    const filters = await Filter.find({
      $or: [
        { filterGroup: { $in: filterGroups.map((fg) => fg._id) } },
        { isGlobal: true },
      ],
      isActive: true,
    })
      .populate("filterGroup")
      .sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, filters });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get filters by category slug
exports.getFiltersByCategorySlug = async (req, res) => {
  try {
    const Category = require("../models/Category");
    const FilterGroup = require("../models/FilterGroup");
    const { categorySlug } = req.params;

    const category = await Category.findOne({
      slug: categorySlug,
      isActive: true,
    });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }

    // Get filter groups for this category
    const filterGroups = await FilterGroup.find({
      category: category._id,
      isActive: true,
    });

    // Get filters for these groups plus global filters
    const filters = await Filter.find({
      $or: [
        { filterGroup: { $in: filterGroups.map((fg) => fg._id) } },
        { isGlobal: true },
      ],
      isActive: true,
    })
      .populate("filterGroup")
      .sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, filters, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a filter
exports.updateFilter = async (req, res) => {
  try {
    const {
      name,
      type,
      options,
      rangeConfig,
      filterGroup,
      isGlobal,
      isRequired,
      isActive,
      sortOrder,
    } = req.body;

    let updateData = {
      type,
      options,
      rangeConfig,
      filterGroup,
      isGlobal,
      isRequired,
      isActive,
      sortOrder,
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

    const filter = await Filter.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("filterGroup");

    if (!filter) {
      return res
        .status(404)
        .json({ success: false, error: "Filter not found" });
    }

    res.json({ success: true, filter });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update filter options (for dynamic option management)
exports.updateFilterOptions = async (req, res) => {
  try {
    const { options } = req.body;

    const filter = await Filter.findById(req.params.id);
    if (!filter) {
      return res
        .status(404)
        .json({ success: false, error: "Filter not found" });
    }

    filter.options = options;
    await filter.save();
    await filter.populate("filterGroup");

    res.json({ success: true, filter });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a filter
exports.deleteFilter = async (req, res) => {
  try {
    // Check if filter is being used in any product attributes
    const Product = require("../models/Product");
    const productCount = await Product.countDocuments({
      "attributes.filter": req.params.id,
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete filter. It is used in ${productCount} product(s).`,
      });
    }

    const filter = await Filter.findByIdAndDelete(req.params.id);
    if (!filter) {
      return res
        .status(404)
        .json({ success: false, error: "Filter not found" });
    }

    res.json({ success: true, message: "Filter deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Toggle filter status
exports.toggleFilterStatus = async (req, res) => {
  try {
    const filter = await Filter.findById(req.params.id);
    if (!filter) {
      return res
        .status(404)
        .json({ success: false, error: "Filter not found" });
    }

    filter.isActive = !filter.isActive;
    await filter.save();
    await filter.populate("filterGroup");

    res.json({
      success: true,
      filter,
      message: `Filter ${filter.isActive ? "activated" : "deactivated"}`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
