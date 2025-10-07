const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { protect, adminOnly } = require("../middlewares/auth");

// User routes (require authentication)
router.post("/", protect, addressController.createAddress);
router.get("/my-addresses", protect, addressController.getUserAddresses);
router.get("/default", protect, addressController.getDefaultAddress);
router.get("/:id", protect, addressController.getAddressById);
router.put("/:id", protect, addressController.updateAddress);
router.put("/:id/set-default", protect, addressController.setDefaultAddress);
router.delete("/:id", protect, addressController.deleteAddress);

// Admin routes (require admin role)
router.get("/", protect, adminOnly, addressController.getAllAddresses);
router.get("/user/:userId", protect, adminOnly, addressController.getAddressesByUserId);

module.exports = router;
