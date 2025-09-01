const express = require("express");
const router = express.Router();
const deliveryOptionController = require("../controllers/deliveryController");

// Public routes
router.get("/", deliveryOptionController.getDeliveryOptions);
router.get("/available", deliveryOptionController.getAvailableDeliveryOptions);
router.get("/:id", deliveryOptionController.getDeliveryOptionById);

// Admin routes
router.post("/", deliveryOptionController.createDeliveryOption);
router.get("/admin/all", deliveryOptionController.getAllDeliveryOptions);
router.get("/admin/stats", deliveryOptionController.getDeliveryOptionStats);
router.put("/:id", deliveryOptionController.updateDeliveryOption);
router.put(
  "/:id/toggle-status",
  deliveryOptionController.toggleDeliveryOptionStatus
);
router.delete("/:id", deliveryOptionController.deleteDeliveryOption);

module.exports = router;
