const express = require("express");
const router = express.Router();
const productController = require("../../controllers/v3/productController");
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
router.get("/", productController.getProducts);
router.get("/search", productController.searchProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/new", productController.getNewProducts);
router.get("/:id", productController.getProductById);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/category/slug/:categorySlug", productController.getProductsByCategorySlug);

// Protected routes (admin only)
router.post("/", protect, adminOnly, upload.array("images"), productController.createProduct);
router.put("/:id", protect, adminOnly, upload.array("images"), productController.updateProduct);
router.delete("/:id", protect, adminOnly, productController.deleteProduct);

module.exports = router;

