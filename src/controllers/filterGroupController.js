const FilterGroup = require("../models/FilterGroup");

// Create a filter group
exports.createFilterGroup = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const filterGroup = new FilterGroup({
      name,
      slug,
      description,
      category,
    });

    await filterGroup.save();
    await filterGroup.populate("category");
    res.status(201).json({ success: true, filterGroup });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all filter groups
exports.getFilterGroups = async (req, res) => {
  try {
    const filterGroups = await FilterGroup.find({ isActive: true })
      .populate("category")
      .sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, filterGroups });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all filter groups (including inactive) - Admin only
exports.getAllFilterGroups = async (req, res) => {
  try {
    const filterGroups = await FilterGroup.find()
      .populate("category")
      .sort({ isActive: -1, sortOrder: 1, name: 1 });
    res.json({ success: true, filterGroups });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a filter group by ID
exports.getFilterGroupById = async (req, res) => {
  try {
    const filterGroup = await FilterGroup.findById(req.params.id).populate(
      "category"
    );
    if (!filterGroup) {
      return res
        .status(404)
        .json({ success: false, error: "Filter group not found" });
    }
    res.json({ success: true, filterGroup });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a filter group by slug
exports.getFilterGroupBySlug = async (req, res) => {
  try {
    const filterGroup = await FilterGroup.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("category");
    if (!filterGroup) {
      return res
        .status(404)
        .json({ success: false, error: "Filter group not found" });
    }
    res.json({ success: true, filterGroup });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get filter groups by category
exports.getFilterGroupsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const filterGroups = await FilterGroup.find({
      category: categoryId,
      isActive: true,
    })
      .populate("category")
      .sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, filterGroups });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get filter groups by category slug
exports.getFilterGroupsByCategorySlug = async (req, res) => {
  try {
    const Category = require("../models/Category");
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

    const filterGroups = await FilterGroup.find({
      category: category._id,
      isActive: true,
    })
      .populate("category")
      .sort({ sortOrder: 1, name: 1 });

    res.json({ success: true, filterGroups, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get filter group with its filters
exports.getFilterGroupWithFilters = async (req, res) => {
  try {
    const Filter = require("../models/Filter");

    const filterGroup = await FilterGroup.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("category");

    if (!filterGroup) {
      return res
        .status(404)
        .json({ success: false, error: "Filter group not found" });
    }

    const filters = await Filter.find({
      filterGroup: filterGroup._id,
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      filterGroup: {
        ...filterGroup.toObject(),
        filters,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a filter group
exports.updateFilterGroup = async (req, res) => {
  try {
    const { name, description, category, isActive, sortOrder } = req.body;

    let updateData = { description, category, isActive, sortOrder };

    // If name is being updated, generate new slug
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updateData.name = name;
      updateData.slug = slug;
    }

    const filterGroup = await FilterGroup.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("category");

    if (!filterGroup) {
      return res
        .status(404)
        .json({ success: false, error: "Filter group not found" });
    }

    res.json({ success: true, filterGroup });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a filter group
exports.deleteFilterGroup = async (req, res) => {
  try {
    // Check if filter group has filters
    const Filter = require("../models/Filter");
    const filterCount = await Filter.countDocuments({
      filterGroup: req.params.id,
    });

    if (filterCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete filter group. It has ${filterCount} filter(s) associated with it.`,
      });
    }

    const filterGroup = await FilterGroup.findByIdAndDelete(req.params.id);
    if (!filterGroup) {
      return res
        .status(404)
        .json({ success: false, error: "Filter group not found" });
    }

    res.json({ success: true, message: "Filter group deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Toggle filter group status
exports.toggleFilterGroupStatus = async (req, res) => {
  try {
    const filterGroup = await FilterGroup.findById(req.params.id);
    if (!filterGroup) {
      return res
        .status(404)
        .json({ success: false, error: "Filter group not found" });
    }

    filterGroup.isActive = !filterGroup.isActive;
    await filterGroup.save();
    await filterGroup.populate("category");

    res.json({
      success: true,
      filterGroup,
      message: `Filter group ${
        filterGroup.isActive ? "activated" : "deactivated"
      }`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get filter group filter count
exports.getFilterGroupFilterCount = async (req, res) => {
  try {
    const Filter = require("../models/Filter");

    const filterGroup = await FilterGroup.findById(req.params.id).populate(
      "category"
    );
    if (!filterGroup) {
      return res
        .status(404)
        .json({ success: false, error: "Filter group not found" });
    }

    const filterCount = await Filter.countDocuments({
      filterGroup: filterGroup._id,
      isActive: true,
    });

    res.json({ success: true, filterGroup, filterCount });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
