const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/v2/categoryController");
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
router.get("/", categoryController.getCategories);
router.get("/tree", categoryController.getCategoryTree);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/:id/breadcrumb", categoryController.getCategoryBreadcrumb);

// Protected routes (admin only)
router.post("/", protect, adminOnly, upload.single("image"), categoryController.createCategory);
router.put("/:id", protect, adminOnly, upload.single("image"), categoryController.updateCategory);
router.delete("/:id", protect, adminOnly, categoryController.deleteCategory);

module.exports = router;

