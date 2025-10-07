const express = require("express");
const { protect } = require('../middlewares/auth');
const router = express.Router();
const cartController = require("../controllers/cartController");
router.use(protect);

router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/update", cartController.updateCartItem);
router.delete("/remove/:productId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);
router.get("/count", cartController.getCartCount);
router.get("/total", cartController.getCartTotal);

module.exports = router; 