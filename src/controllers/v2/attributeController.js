const {
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
const initialAttributesData = require("../data/initialAttributes.json");

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

  // Initialize all attributes from embedded JSON data
  initializeAttributes: async (req, res) => {
    try {
      console.log('Starting attribute initialization...');
      console.log('Initial attributes data loaded:', !!initialAttributesData);
      
      const { 
        categories = [], 
        brands = [], 
        colors = [], 
        sizes = [], 
        materials = [], 
        genders = [], 
        seasons = [], 
        styles = [], 
        patterns = [], 
        shoeHeights = [], 
        fits = [], 
        occasions = [], 
        collarTypes = [] 
      } = initialAttributesData;
      
      console.log('Data counts:', {
        categories: categories.length,
        brands: brands.length,
        colors: colors.length,
        sizes: sizes.length,
        materials: materials.length,
        genders: genders.length,
        seasons: seasons.length,
        styles: styles.length,
        patterns: patterns.length,
        shoeHeights: shoeHeights.length,
        fits: fits.length,
        occasions: occasions.length,
        collarTypes: collarTypes.length
      });

      const results = {
        categories: { created: 0, skipped: 0, errors: [] },
        brands: { created: 0, skipped: 0, errors: [] },
        colors: { created: 0, skipped: 0, errors: [] },
        sizes: { created: 0, skipped: 0, errors: [] },
        materials: { created: 0, skipped: 0, errors: [] },
        genders: { created: 0, skipped: 0, errors: [] },
        seasons: { created: 0, skipped: 0, errors: [] },
        styles: { created: 0, skipped: 0, errors: [] },
        patterns: { created: 0, skipped: 0, errors: [] },
        shoeHeights: { created: 0, skipped: 0, errors: [] },
        fits: { created: 0, skipped: 0, errors: [] },
        occasions: { created: 0, skipped: 0, errors: [] },
        collarTypes: { created: 0, skipped: 0, errors: [] },
      };

      // Helper function to create attributes with error handling
      const createAttributes = async (Model, items, resultKey) => {
        for (const item of items) {
          try {
            // Check if item already exists by slug
            const existing = await Model.findOne({ slug: item.slug });
            if (existing) {
              results[resultKey].skipped++;
              continue;
            }

            // Create new attribute
            await Model.create(item);
            results[resultKey].created++;
          } catch (error) {
            results[resultKey].errors.push({
              item: item.name || item.slug,
              error: error.message
            });
          }
        }
      };

      // Process categories first (needed for hierarchical relationships)
      if (categories.length > 0) {
        await createAttributes(CategoryV2, categories, 'categories');
      }

      // Process brands
      if (brands.length > 0) {
        await createAttributes(BrandV2, brands, 'brands');
      }

      // Process colors
      if (colors.length > 0) {
        await createAttributes(ColorV2, colors, 'colors');
      }

      // Process sizes
      if (sizes.length > 0) {
        await createAttributes(SizeV2, sizes, 'sizes');
      }

      // Process materials
      if (materials.length > 0) {
        await createAttributes(MaterialV2, materials, 'materials');
      }

      // Process genders
      if (genders.length > 0) {
        await createAttributes(GenderV2, genders, 'genders');
      }

      // Process seasons
      if (seasons.length > 0) {
        await createAttributes(SeasonV2, seasons, 'seasons');
      }

      // Process styles
      if (styles.length > 0) {
        await createAttributes(StyleV2, styles, 'styles');
      }

      // Process patterns
      if (patterns.length > 0) {
        await createAttributes(PatternV2, patterns, 'patterns');
      }

      // Process shoe heights
      if (shoeHeights.length > 0) {
        await createAttributes(ShoeHeightV2, shoeHeights, 'shoeHeights');
      }

      // Process fits
      if (fits.length > 0) {
        await createAttributes(FitV2, fits, 'fits');
      }

      // Process occasions
      if (occasions.length > 0) {
        await createAttributes(OccasionV2, occasions, 'occasions');
      }

      // Process collar types
      if (collarTypes.length > 0) {
        await createAttributes(CollarTypeV2, collarTypes, 'collarTypes');
      }

      // Calculate totals
      const totalCreated = Object.values(results).reduce((sum, result) => sum + result.created, 0);
      const totalSkipped = Object.values(results).reduce((sum, result) => sum + result.skipped, 0);
      const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errors.length, 0);

      res.status(200).json({
        success: true,
        message: 'Attribute initialization completed',
        summary: {
          totalCreated,
          totalSkipped,
          totalErrors
        },
        details: results
      });

    } catch (err) {
      console.error('Error in initializeAttributes:', err);
      res.status(500).json({ 
        success: false, 
        error: err.message,
        message: 'Failed to initialize attributes',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  },
};

