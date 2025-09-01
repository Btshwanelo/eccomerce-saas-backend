const express = require("express");
const router = express.Router();
const subcategoryController = require("../controllers/subcategoryController");

router.post("/", subcategoryController.createSubcategory);
router.get("/", subcategoryController.getSubcategories);
router.get("/:id", subcategoryController.getSubcategoryById);
router.get("/slug/:slug", subcategoryController.getSubcategoryBySlug);
router.get(
  "/category/:categoryId",
  subcategoryController.getSubcategoriesByCategory
);
router.get(
  "/category/slug/:categorySlug",
  subcategoryController.getSubcategoriesByCategorySlug
);
router.get(
  "/:id/products/count",
  subcategoryController.getSubcategoryProductCount
);
router.put("/:id", subcategoryController.updateSubcategory);
router.delete("/:id", subcategoryController.deleteSubcategory);

module.exports = router;
