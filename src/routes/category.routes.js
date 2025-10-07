const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middlewares/auth");

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/type/:categoryType", categoryController.getCategoriesByType);
router.get(
  "/:slug/subcategories",
  categoryController.getCategoryWithSubcategories
);
router.get("/:id/products/count", categoryController.getCategoryProductCount);

// Admin-only routes
router.post("/", protect, adminOnly, categoryController.createCategory);
router.put("/:id", protect, adminOnly, categoryController.updateCategory);
router.delete("/:id", protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
