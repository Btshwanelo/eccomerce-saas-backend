const express = require("express");
const { protect, adminOnly } = require("../../middlewares/auth");
const router = express.Router();
const deliveryController = require("../../controllers/v2/deliveryController");

// Public routes (no authentication required)
router.get("/", deliveryController.getDeliveryOptions);
router.get("/available", deliveryController.getAvailableDeliveryOptions);
router.get("/:id", deliveryController.getDeliveryOptionById);

// Admin routes (require admin role)
router.post("/", protect, adminOnly, deliveryController.createDeliveryOption);
router.put("/:id", protect, adminOnly, deliveryController.updateDeliveryOption);
router.delete("/:id", protect, adminOnly, deliveryController.deleteDeliveryOption);
router.put("/:id/toggle-status", protect, adminOnly, deliveryController.toggleDeliveryOptionStatus);

module.exports = router;
