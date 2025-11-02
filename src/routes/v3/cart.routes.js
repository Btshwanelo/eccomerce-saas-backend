const express = require("express");
const router = express.Router();
const cartController = require("../../controllers/v3/cartController");
const { protect } = require("../../middlewares/auth");

// ==================== CART ROUTES ====================
// Public routes (session-based cart management)
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/items/:itemId", cartController.updateCartItem);
router.delete("/items/:itemId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);

// ==================== COUPON ROUTES ====================
// Public routes
router.post("/coupon", cartController.applyCoupon);
router.delete("/coupon", cartController.removeCoupon);

// ==================== CART MERGE ROUTES ====================
// Protected routes (authenticated users only)
router.post("/merge", protect, cartController.mergeCart);

module.exports = router;

