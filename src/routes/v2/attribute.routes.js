const express = require("express");
const router = express.Router();
const attributeController = require("../../controllers/v2/attributeController");
const { protect, adminOnly } = require("../../middlewares/auth");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ==================== COLOR ROUTES ====================
// Public routes
router.get("/colors", attributeController.getColors);
router.get("/colors/:id", attributeController.getColorById);
router.get("/colors/slug/:slug", attributeController.getColorBySlug);

// Protected routes (admin only)
router.post("/colors", protect, adminOnly, attributeController.createColor);
router.put("/colors/:id", protect, adminOnly, attributeController.updateColor);
router.delete("/colors/:id", protect, adminOnly, attributeController.deleteColor);

// ==================== SIZE ROUTES ====================
// Public routes
router.get("/sizes", attributeController.getSizes);
router.get("/sizes/:id", attributeController.getSizeById);
router.get("/sizes/slug/:slug", attributeController.getSizeBySlug);

// Protected routes (admin only)
router.post("/sizes", protect, adminOnly, attributeController.createSize);
router.put("/sizes/:id", protect, adminOnly, attributeController.updateSize);
router.delete("/sizes/:id", protect, adminOnly, attributeController.deleteSize);

// ==================== MATERIAL ROUTES ====================
// Public routes
router.get("/materials", attributeController.getMaterials);
router.get("/materials/:id", attributeController.getMaterialById);
router.get("/materials/slug/:slug", attributeController.getMaterialBySlug);

// Protected routes (admin only)
router.post("/materials", protect, adminOnly, attributeController.createMaterial);
router.put("/materials/:id", protect, adminOnly, attributeController.updateMaterial);
router.delete("/materials/:id", protect, adminOnly, attributeController.deleteMaterial);

// ==================== GENDER ROUTES ====================
// Public routes
router.get("/genders", attributeController.getGenders);
router.get("/genders/:id", attributeController.getGenderById);
router.get("/genders/slug/:slug", attributeController.getGenderBySlug);

// Protected routes (admin only)
router.post("/genders", protect, adminOnly, attributeController.createGender);
router.put("/genders/:id", protect, adminOnly, attributeController.updateGender);
router.delete("/genders/:id", protect, adminOnly, attributeController.deleteGender);

// ==================== SEASON ROUTES ====================
// Public routes
router.get("/seasons", attributeController.getSeasons);
router.get("/seasons/:id", attributeController.getSeasonById);
router.get("/seasons/slug/:slug", attributeController.getSeasonBySlug);

// Protected routes (admin only)
router.post("/seasons", protect, adminOnly, attributeController.createSeason);
router.put("/seasons/:id", protect, adminOnly, attributeController.updateSeason);
router.delete("/seasons/:id", protect, adminOnly, attributeController.deleteSeason);

// ==================== STYLE ROUTES ====================
// Public routes
router.get("/styles", attributeController.getStyles);
router.get("/styles/:id", attributeController.getStyleById);
router.get("/styles/slug/:slug", attributeController.getStyleBySlug);
router.get("/styles/category/:categoryId", attributeController.getStylesByCategory);

// Protected routes (admin only)
router.post("/styles", protect, adminOnly, attributeController.createStyle);
router.put("/styles/:id", protect, adminOnly, attributeController.updateStyle);
router.delete("/styles/:id", protect, adminOnly, attributeController.deleteStyle);

// ==================== PATTERN ROUTES ====================
// Public routes
router.get("/patterns", attributeController.getPatterns);
router.get("/patterns/:id", attributeController.getPatternById);
router.get("/patterns/slug/:slug", attributeController.getPatternBySlug);

// Protected routes (admin only)
router.post("/patterns", protect, adminOnly, upload.single("patternImage"), attributeController.createPattern);
router.put("/patterns/:id", protect, adminOnly, upload.single("patternImage"), attributeController.updatePattern);
router.delete("/patterns/:id", protect, adminOnly, attributeController.deletePattern);

// ==================== SHOE HEIGHT ROUTES ====================
// Public routes
router.get("/shoe-heights", attributeController.getShoeHeights);
router.get("/shoe-heights/:id", attributeController.getShoeHeightById);
router.get("/shoe-heights/slug/:slug", attributeController.getShoeHeightBySlug);
router.get("/shoe-heights/category/:categoryId", attributeController.getShoeHeightsByCategory);

// Protected routes (admin only)
router.post("/shoe-heights", protect, adminOnly, attributeController.createShoeHeight);
router.put("/shoe-heights/:id", protect, adminOnly, attributeController.updateShoeHeight);
router.delete("/shoe-heights/:id", protect, adminOnly, attributeController.deleteShoeHeight);

// ==================== FIT ROUTES ====================
// Public routes
router.get("/fits", attributeController.getFits);
router.get("/fits/:id", attributeController.getFitById);
router.get("/fits/slug/:slug", attributeController.getFitBySlug);
router.get("/fits/category/:categoryId", attributeController.getFitsByCategory);

// Protected routes (admin only)
router.post("/fits", protect, adminOnly, attributeController.createFit);
router.put("/fits/:id", protect, adminOnly, attributeController.updateFit);
router.delete("/fits/:id", protect, adminOnly, attributeController.deleteFit);

// ==================== OCCASION ROUTES ====================
// Public routes
router.get("/occasions", attributeController.getOccasions);
router.get("/occasions/:id", attributeController.getOccasionById);
router.get("/occasions/slug/:slug", attributeController.getOccasionBySlug);

// Protected routes (admin only)
router.post("/occasions", protect, adminOnly, attributeController.createOccasion);
router.put("/occasions/:id", protect, adminOnly, attributeController.updateOccasion);
router.delete("/occasions/:id", protect, adminOnly, attributeController.deleteOccasion);

// ==================== COLLAR TYPE ROUTES ====================
// Public routes
router.get("/collar-types", attributeController.getCollarTypes);
router.get("/collar-types/:id", attributeController.getCollarTypeById);
router.get("/collar-types/slug/:slug", attributeController.getCollarTypeBySlug);
router.get("/collar-types/category/:categoryId", attributeController.getCollarTypesByCategory);

// Protected routes (admin only)
router.post("/collar-types", protect, adminOnly, attributeController.createCollarType);
router.put("/collar-types/:id", protect, adminOnly, attributeController.updateCollarType);
router.delete("/collar-types/:id", protect, adminOnly, attributeController.deleteCollarType);

// ==================== UTILITY ROUTES ====================
// Get all attributes for a category
router.get("/category/:categoryId/all", attributeController.getAttributesForCategory);

// Initialize all attributes from JSON data (admin only)
router.post("/initialize", protect, adminOnly, attributeController.initializeAttributes);

module.exports = router;

