const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { protect, adminOnly } = require("../middlewares/auth");

// Public routes
router.get("/", brandController.getBrands);
router.get("/:id", brandController.getBrandById);
router.get("/slug/:slug", brandController.getBrandBySlug);

// Admin-only routes
router.post("/", protect, adminOnly, brandController.createBrand);
router.put("/:id", protect, adminOnly, brandController.updateBrand);
router.delete("/:id", protect, adminOnly, brandController.deleteBrand);

module.exports = router;
