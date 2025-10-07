const express = require("express");
const router = express.Router();
const brandController = require("../../controllers/v2/brandController");
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

// Public routes
router.get("/", brandController.getBrands);
router.get("/:id", brandController.getBrandById);
router.get("/slug/:slug", brandController.getBrandBySlug);

// Protected routes (admin only)
router.post("/", protect, adminOnly, upload.single("logo"), brandController.createBrand);
router.put("/:id", protect, adminOnly, upload.single("logo"), brandController.updateBrand);
router.delete("/:id", protect, adminOnly, brandController.deleteBrand);

module.exports = router;

