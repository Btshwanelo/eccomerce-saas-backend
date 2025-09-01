const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

// User routes
router.post("/", addressController.createAddress);
router.get("/my-addresses", addressController.getUserAddresses);
router.get("/default", addressController.getDefaultAddress);
router.get("/:id", addressController.getAddressById);
router.put("/:id", addressController.updateAddress);
router.put("/:id/set-default", addressController.setDefaultAddress);
router.delete("/:id", addressController.deleteAddress);

// Admin routes
router.get("/", addressController.getAllAddresses);
router.get("/user/:userId", addressController.getAddressesByUserId);

module.exports = router;
