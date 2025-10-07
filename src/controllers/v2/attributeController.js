const {
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

// Generic controller functions for attributes
const createAttributeController = (Model, attributeName) => {
  return {
    // Create attribute
    [`create${attributeName}`]: async (req, res) => {
      try {
        const attributeData = req.body;

        // Generate slug from name
        const slug = attributeData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const attribute = new Model({
          ...attributeData,
          slug,
        });

        await attribute.save();
        res.status(201).json({ success: true, [attributeName.toLowerCase()]: attribute });
      } catch (err) {
        res.status(400).json({ success: false, error: err.message });
      }
    },

    // Get all attributes
    [`get${attributeName}s`]: async (req, res) => {
      try {
        const {
          page = 1,
          limit = 50,
          sort = "sortOrder",
          isActive = true,
          search,
          category, // For size-specific filtering
        } = req.query;

        const filter = { isActive };

        // Size-specific category filter
        if (category && Model === SizeV2) {
          filter.category = category;
        }

        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ];
        }

        const skip = (page - 1) * limit;
        const attributes = await Model.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(Number(limit));

        const total = await Model.countDocuments(filter);

        res.json({
          success: true,
          [attributeName.toLowerCase() + "s"]: attributes,
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        });
      } catch (err) {
        res.status(400).json({ success: false, error: err.message });
      }
    },

    // Get attribute by ID
    [`get${attributeName}ById`]: async (req, res) => {
      try {
        const attribute = await Model.findById(req.params.id);
        
        if (!attribute) {
          return res.status(404).json({ success: false, error: `${attributeName} not found` });
        }

        res.json({ success: true, [attributeName.toLowerCase()]: attribute });
      } catch (err) {
        res.status(400).json({ success: false, error: err.message });
      }
    },

    // Get attribute by slug
    [`get${attributeName}BySlug`]: async (req, res) => {
      try {
        const attribute = await Model.findOne({
          slug: req.params.slug,
          isActive: true,
        });
        
        if (!attribute) {
          return res.status(404).json({ success: false, error: `${attributeName} not found` });
        }

        res.json({ success: true, [attributeName.toLowerCase()]: attribute });
      } catch (err) {
        res.status(400).json({ success: false, error: err.message });
      }
    },

    // Update attribute
    [`update${attributeName}`]: async (req, res) => {
      try {
        const attributeData = req.body;
        const attributeId = req.params.id;

        // Handle name change and slug generation
        if (attributeData.name) {
          const slug = attributeData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          attributeData.slug = slug;
        }

        const attribute = await Model.findByIdAndUpdate(
          attributeId,
          attributeData,
          { new: true }
        );

        if (!attribute) {
          return res.status(404).json({ success: false, error: `${attributeName} not found` });
        }

        res.json({ success: true, [attributeName.toLowerCase()]: attribute });
      } catch (err) {
        res.status(400).json({ success: false, error: err.message });
      }
    },

    // Delete attribute
    [`delete${attributeName}`]: async (req, res) => {
      try {
        const attribute = await Model.findByIdAndDelete(req.params.id);
        
        if (!attribute) {
          return res.status(404).json({ success: false, error: `${attributeName} not found` });
        }

        res.json({ success: true, message: `${attributeName} deleted successfully` });
      } catch (err) {
        res.status(400).json({ success: false, error: err.message });
      }
    },
  };
};

// Create controllers for each attribute type
const colorController = createAttributeController(ColorV2, "Color");
const sizeController = createAttributeController(SizeV2, "Size");
const materialController = createAttributeController(MaterialV2, "Material");
const genderController = createAttributeController(GenderV2, "Gender");
const seasonController = createAttributeController(SeasonV2, "Season");
const styleController = createAttributeController(StyleV2, "Style");
// Custom pattern controller with file upload support
const patternController = {
  // Create pattern with image upload
  createPattern: async (req, res) => {
    try {
      const patternData = req.body;

      // Generate slug from name
      const slug = patternData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Handle pattern image upload
      if (req.file) {
        try {
          validateImageFile(req.file);
          const uploadResult = await uploadFileToStorage(req.file);
          patternData.patternImage = uploadResult.downloadUrl;
        } catch (uploadError) {
          console.error("Pattern image upload failed:", uploadError);
          return res.status(400).json({
            success: false,
            error: `Failed to upload pattern image: ${uploadError.message}`,
          });
        }
      }

      const pattern = new PatternV2({
        ...patternData,
        slug,
      });

      await pattern.save();
      res.status(201).json({ success: true, pattern });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  // Update pattern with image upload
  updatePattern: async (req, res) => {
    try {
      const patternData = req.body;
      const patternId = req.params.id;

      // Handle name change and slug generation
      if (patternData.name) {
        const slug = patternData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        patternData.slug = slug;
      }

      // Handle pattern image upload
      if (req.file) {
        try {
          validateImageFile(req.file);
          const uploadResult = await uploadFileToStorage(req.file);
          patternData.patternImage = uploadResult.downloadUrl;
        } catch (uploadError) {
          console.error("Pattern image upload failed:", uploadError);
          return res.status(400).json({
            success: false,
            error: `Failed to upload pattern image: ${uploadError.message}`,
          });
        }
      }

      const pattern = await PatternV2.findByIdAndUpdate(
        patternId,
        { ...patternData, updatedAt: Date.now() },
        { new: true }
      );

      if (!pattern) {
        return res.status(404).json({ success: false, error: "Pattern not found" });
      }

      res.json({ success: true, pattern });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  // Get all patterns
  getPatterns: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        sort = "sortOrder",
        isActive = true,
        search,
      } = req.query;

      const filter = { isActive };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;
      const patterns = await PatternV2.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

      const total = await PatternV2.countDocuments(filter);

      res.json({
        success: true,
        patterns,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  // Get pattern by ID
  getPatternById: async (req, res) => {
    try {
      const pattern = await PatternV2.findById(req.params.id);

      if (!pattern) {
        return res.status(404).json({ success: false, error: "Pattern not found" });
      }

      res.json({ success: true, pattern });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  // Get pattern by slug
  getPatternBySlug: async (req, res) => {
    try {
      const pattern = await PatternV2.findOne({
        slug: req.params.slug,
        isActive: true,
      });

      if (!pattern) {
        return res.status(404).json({ success: false, error: "Pattern not found" });
      }

      res.json({ success: true, pattern });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  // Delete pattern
  deletePattern: async (req, res) => {
    try {
      const pattern = await PatternV2.findByIdAndDelete(req.params.id);

      if (!pattern) {
        return res.status(404).json({ success: false, error: "Pattern not found" });
      }

      res.json({ success: true, message: "Pattern deleted successfully" });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
};
const shoeHeightController = createAttributeController(ShoeHeightV2, "ShoeHeight");
const fitController = createAttributeController(FitV2, "Fit");
const occasionController = createAttributeController(OccasionV2, "Occasion");
const collarTypeController = createAttributeController(CollarTypeV2, "CollarType");

// Export all controllers
module.exports = {
  // Color controller
  ...colorController,

  // Size controller
  ...sizeController,

  // Material controller
  ...materialController,

  // Gender controller
  ...genderController,

  // Season controller
  ...seasonController,

  // Style controller
  ...styleController,

  // Pattern controller
  ...patternController,

  // Shoe Height controller
  ...shoeHeightController,

  // Fit controller
  ...fitController,

  // Occasion controller
  ...occasionController,

  // Collar Type controller
  ...collarTypeController,

  // Special methods for Style, ShoeHeight, Fit, and CollarType (category-specific)
  getStylesByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { isActive = true } = req.query;

      const styles = await StyleV2.find({
        isActive,
        $or: [
          { applicableCategories: { $in: [categoryId] } },
          { applicableCategories: { $size: 0 } }, // Global styles
        ],
      }).sort({ sortOrder: 1, name: 1 });

      res.json({ success: true, styles });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  getShoeHeightsByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { isActive = true } = req.query;

      const shoeHeights = await ShoeHeightV2.find({
        isActive,
        $or: [
          { applicableCategories: { $in: [categoryId] } },
          { applicableCategories: { $size: 0 } }, // Global shoe heights
        ],
      }).sort({ sortOrder: 1, name: 1 });

      res.json({ success: true, shoeHeights });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  getFitsByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { isActive = true } = req.query;

      const fits = await FitV2.find({
        isActive,
        $or: [
          { applicableCategories: { $in: [categoryId] } },
          { applicableCategories: { $size: 0 } }, // Global fits
        ],
      }).sort({ sortOrder: 1, name: 1 });

      res.json({ success: true, fits });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  getCollarTypesByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { isActive = true } = req.query;

      const collarTypes = await CollarTypeV2.find({
        isActive,
        $or: [
          { applicableCategories: { $in: [categoryId] } },
          { applicableCategories: { $size: 0 } }, // Global collar types
        ],
      }).sort({ sortOrder: 1, name: 1 });

      res.json({ success: true, collarTypes });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  // Get all attributes for a category (useful for product creation)
  getAttributesForCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { isActive = true } = req.query;

      const [
        colors,
        sizes,
        materials,
        genders,
        seasons,
        styles,
        patterns,
        shoeHeights,
        fits,
        occasions,
        collarTypes,
      ] = await Promise.all([
        ColorV2.find({ isActive }).sort({ sortOrder: 1, name: 1 }),
        SizeV2.find({ isActive }).sort({ sortOrder: 1, name: 1 }),
        MaterialV2.find({ isActive }).sort({ sortOrder: 1, name: 1 }),
        GenderV2.find({ isActive }).sort({ sortOrder: 1, name: 1 }),
        SeasonV2.find({ isActive }).sort({ sortOrder: 1, name: 1 }),
        StyleV2.find({
          isActive,
          $or: [
            { applicableCategories: { $in: [categoryId] } },
            { applicableCategories: { $size: 0 } },
          ],
        }).sort({ sortOrder: 1, name: 1 }),
        PatternV2.find({ isActive }).sort({ sortOrder: 1, name: 1 }),
        ShoeHeightV2.find({
          isActive,
          $or: [
            { applicableCategories: { $in: [categoryId] } },
            { applicableCategories: { $size: 0 } },
          ],
        }).sort({ sortOrder: 1, name: 1 }),
        FitV2.find({
          isActive,
          $or: [
            { applicableCategories: { $in: [categoryId] } },
            { applicableCategories: { $size: 0 } },
          ],
        }).sort({ sortOrder: 1, name: 1 }),
        OccasionV2.find({ isActive }).sort({ sortOrder: 1, name: 1 }),
        CollarTypeV2.find({
          isActive,
          $or: [
            { applicableCategories: { $in: [categoryId] } },
            { applicableCategories: { $size: 0 } },
          ],
        }).sort({ sortOrder: 1, name: 1 }),
      ]);

      res.json({
        success: true,
        attributes: {
          colors,
          sizes,
          materials,
          genders,
          seasons,
          styles,
          patterns,
          shoeHeights,
          fits,
          occasions,
          collarTypes,
        },
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
};

