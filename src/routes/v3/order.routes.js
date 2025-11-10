const express = require("express");
const { protect, optionalAuth, adminOnly } = require("../../middlewares/auth");
const router = express.Router();
const orderController = require("../../controllers/v3/orderController");

// Checkout routes (require authentication or guest session)
router.post("/checkout/initiate", optionalAuth, orderController.initiateCheckout);
router.post("/checkout/validate", optionalAuth, orderController.validateCheckout);
router.post("/checkout/complete", optionalAuth, orderController.completeCheckout);

// Order management routes (require authentication or guest session)
router.get("/", optionalAuth, orderController.getUserOrders);
router.get("/:id", optionalAuth, orderController.getOrderById);
router.get("/number/:orderNumber", optionalAuth, orderController.getOrderByNumber);
router.put("/:id/cancel", optionalAuth, orderController.cancelOrder);
router.put("/:id/confirm-payment", optionalAuth, orderController.confirmPaymentSuccess);

// Admin routes (require admin authentication)
router.put("/:id/status", protect, adminOnly, orderController.updateOrderStatus);

module.exports = router;

