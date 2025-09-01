const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/type/:categoryType", categoryController.getCategoriesByType);
router.get(
  "/:slug/subcategories",
  categoryController.getCategoryWithSubcategories
);
router.get("/:id/products/count", categoryController.getCategoryProductCount);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
