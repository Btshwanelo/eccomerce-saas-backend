const express = require("express");
const { protect, adminOnly } = require('../middlewares/auth');
const router = express.Router();
router.use(protect);
const orderController = require("../controllers/orderController");

// User routes
router.post("/", orderController.createOrder);
router.get("/my-orders", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.get("/number/:orderNumber", orderController.getOrderByNumber);
router.put("/:id/cancel", orderController.cancelOrder);

// Admin routes
router.get("/", orderController.getAllOrders);
router.put("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);
router.get("/admin/stats", orderController.getOrderStats);

module.exports = router;
