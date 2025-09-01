const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");

router.post("/", brandController.createBrand);
router.get("/", brandController.getBrands);
router.get("/:id", brandController.getBrandById);
router.get("/slug/:slug", brandController.getBrandBySlug);
router.put("/:id", brandController.updateBrand);
router.delete("/:id", brandController.deleteBrand);

module.exports = router;
