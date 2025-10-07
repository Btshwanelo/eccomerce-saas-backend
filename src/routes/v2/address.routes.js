const express = require("express");
const { protect, optionalAuth } = require("../../middlewares/auth");
const router = express.Router();
const addressController = require("../../controllers/v2/addressController");

// Address management routes (require authentication or guest session)
router.get("/", optionalAuth, addressController.getUserAddresses);
router.get("/default", optionalAuth, addressController.getDefaultAddress);
router.get("/:id", optionalAuth, addressController.getAddressById);
router.post("/", optionalAuth, addressController.createAddress);
router.put("/:id", optionalAuth, addressController.updateAddress);
router.delete("/:id", optionalAuth, addressController.deleteAddress);
router.put("/:id/default", optionalAuth, addressController.setDefaultAddress);

module.exports = router;
