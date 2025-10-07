const express = require("express");
const { protect, adminOnly } = require("../middlewares/auth");
const router = express.Router();
const orderController = require("../controllers/orderController");

// User routes (require authentication)
router.post("/", protect, orderController.createOrder);
router.get("/my-orders", protect, orderController.getUserOrders);
router.get("/:id", protect, orderController.getOrderById);
router.get("/number/:orderNumber", protect, orderController.getOrderByNumber);
router.put("/:id/cancel", protect, orderController.cancelOrder);

// Admin routes (require admin role)
router.get("/", protect, adminOnly, orderController.getAllOrders);
router.put(
  "/:id/status",
  protect,
  adminOnly,
  orderController.updateOrderStatus
);
router.delete("/:id", protect, adminOnly, orderController.deleteOrder);
router.get("/stats", protect, adminOnly, orderController.getOrderStats);

module.exports = router;
