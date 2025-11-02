const express = require("express");
const { protect } = require("../../middlewares/auth");
const router = express.Router();
const addressController = require("../../controllers/v3/addressController");

// Address management routes (require authentication)
router.get("/", protect, addressController.getUserAddresses);
router.get("/default", protect, addressController.getDefaultAddress);
router.get("/:id", protect, addressController.getAddressById);
router.post("/", protect, addressController.createAddress);
router.put("/:id", protect, addressController.updateAddress);
router.delete("/:id", protect, addressController.deleteAddress);
router.put("/:id/default", protect, addressController.setDefaultAddress);

module.exports = router;

