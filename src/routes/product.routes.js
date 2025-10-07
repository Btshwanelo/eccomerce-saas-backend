const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, adminOnly } = require("../middlewares/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.get("/", productController.getProducts);
router.get("/category", productController.getCategoryProducts);
router.get("/:id", productController.getProductById);
router.get("/slug/:slug", productController.getProductBySlug);

// Admin-only routes
router.post("/", protect, adminOnly, upload.array("images"), productController.createProduct);
router.put("/:id", protect, adminOnly, upload.array("images"), productController.updateProduct);
router.delete("/:id", protect, adminOnly, productController.deleteProduct);

module.exports = router;
