const express = require("express");
const router = express.Router();
const filterController = require("../controllers/filterController");

// Public routes
router.get("/", filterController.getFilters);
router.get("/:id", filterController.getFilterById);
router.get("/slug/:slug", filterController.getFilterBySlug);
router.get("/group/:groupId", filterController.getFiltersByGroup);
router.get("/group/slug/:groupSlug", filterController.getFiltersByGroupSlug);
router.get("/global/all", filterController.getGlobalFilters);
router.get("/category/:categoryId", filterController.getFiltersByCategory);
router.get(
  "/category/slug/:categorySlug",
  filterController.getFiltersByCategorySlug
);

// Admin routes
router.post("/", filterController.createFilter);
router.get("/admin/all", filterController.getAllFilters);
router.put("/:id", filterController.updateFilter);
router.put("/:id/options", filterController.updateFilterOptions);
router.put("/:id/toggle-status", filterController.toggleFilterStatus);
router.delete("/:id", filterController.deleteFilter);

module.exports = router;
