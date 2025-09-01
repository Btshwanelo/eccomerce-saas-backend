const express = require("express");
const router = express.Router();
const filterGroupController = require("../controllers/filterGroupController");

// Public routes
router.get("/", filterGroupController.getFilterGroups);
router.get("/:id", filterGroupController.getFilterGroupById);
router.get("/slug/:slug", filterGroupController.getFilterGroupBySlug);
router.get(
  "/category/:categoryId",
  filterGroupController.getFilterGroupsByCategory
);
router.get(
  "/category/slug/:categorySlug",
  filterGroupController.getFilterGroupsByCategorySlug
);
router.get("/:slug/filters", filterGroupController.getFilterGroupWithFilters);
router.get(
  "/:id/filters/count",
  filterGroupController.getFilterGroupFilterCount
);

// Admin routes
router.post("/", filterGroupController.createFilterGroup);
router.get("/admin/all", filterGroupController.getAllFilterGroups);
router.put("/:id", filterGroupController.updateFilterGroup);
router.put("/:id/toggle-status", filterGroupController.toggleFilterGroupStatus);
router.delete("/:id", filterGroupController.deleteFilterGroup);

module.exports = router;
