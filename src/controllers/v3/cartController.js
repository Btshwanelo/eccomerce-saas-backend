const { CartV3, ProductV3 } = require("../../models/v3");

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = subtotal * 0.1; // 10% tax - should be configurable
  const shippingAmount = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + taxAmount + shippingAmount;

  return {
    subtotal,
    taxAmount,
    shippingAmount,
    discountAmount: 0,
    total,
  };
};

// Get or create cart
const getOrCreateCart = async (userId, sessionId) => {
  let cart = await CartV3.findOne({
    $or: [{ userId }, { sessionId }],
  });

  if (!cart) {
    cart = new CartV3({
      userId,
      sessionId,
      items: [],
      totals: {
        subtotal: 0,
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
        total: 0,
      },
    });
    await cart.save();
  }

  return cart;
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers["x-session-id"];

    const cart = await getOrCreateCart(userId, sessionId);

    // Populate product details
    await cart.populate({
      path: "items.productId",
      select: "name slug pricing images status visibility inventory sizes",
    });

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, size, quantity = 1 } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers["x-session-id"];

    // Validate product
    const product = await ProductV3.findOne({
      _id: productId,
      status: "published",
      visibility: "public",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found or not available",
      });
    }

    // Validate size if provided
    if (size) {
      const sizeObj = product.sizes.find((s) => s.name === size);
      if (!sizeObj) {
        return res.status(400).json({
          success: false,
          error: "Size not available for this product",
        });
      }
      if (sizeObj.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          error: "Insufficient stock for selected size",
        });
      }
      if (sizeObj.stockStatus !== "in_stock") {
        return res.status(400).json({
          success: false,
          error: "Size is out of stock",
        });
      }
    } else {
      // Check general product inventory
      if (product.inventory.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          error: "Insufficient stock",
        });
      }
      if (product.inventory.stockStatus !== "in_stock") {
        return res.status(400).json({
          success: false,
          error: "Product is out of stock",
        });
      }
    }

    // Get or create cart
    const cart = await getOrCreateCart(userId, sessionId);

    // Calculate unit price (use sale price if available, otherwise base price)
    const unitPrice =
      product.pricing.salePrice || product.pricing.basePrice;
    let totalPrice = unitPrice * quantity;

    // Check if item already exists in cart (same product and size)
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalPrice =
        cart.items[existingItemIndex].quantity * unitPrice;
    } else {
      // Add new item
      cart.items.push({
        productId,
        size,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Recalculate totals
    cart.totals = calculateCartTotals(cart.items);

    await cart.save();

    // Populate cart items
    await cart.populate({
      path: "items.productId",
      select: "name slug pricing images status visibility inventory sizes",
    });

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers["x-session-id"];

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be greater than 0",
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found",
      });
    }

    // Update quantity and total price
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].totalPrice =
      cart.items[itemIndex].unitPrice * quantity;

    // Recalculate totals
    cart.totals = calculateCartTotals(cart.items);

    await cart.save();

    // Populate cart items
    await cart.populate({
      path: "items.productId",
      select: "name slug pricing images status visibility inventory sizes",
    });

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers["x-session-id"];

    const cart = await getOrCreateCart(userId, sessionId);

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found",
      });
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    cart.totals = calculateCartTotals(cart.items);

    await cart.save();

    // Populate cart items
    await cart.populate({
      path: "items.productId",
      select: "name slug pricing images status visibility inventory sizes",
    });

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers["x-session-id"];

    const cart = await getOrCreateCart(userId, sessionId);

    cart.items = [];
    cart.totals = {
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      discountAmount: 0,
      total: 0,
    };

    await cart.save();

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Apply coupon to cart
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers["x-session-id"];

    // TODO: Implement coupon validation logic
    // For now, just return success
    res.json({
      success: true,
      message: "Coupon applied successfully",
      discountAmount: 0,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Remove coupon from cart
exports.removeCoupon = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers["x-session-id"];

    const cart = await getOrCreateCart(userId, sessionId);

    cart.appliedCoupons = [];
    cart.totals.discountAmount = 0;
    cart.totals.total =
      cart.totals.subtotal +
      cart.totals.taxAmount +
      cart.totals.shippingAmount;

    await cart.save();

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Merge session cart with user cart (when user logs in)
exports.mergeCart = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;

    // Get user cart
    let userCart = await CartV3.findOne({ userId });

    // Get session cart
    const sessionCart = await CartV3.findOne({ sessionId });

    if (!sessionCart || sessionCart.items.length === 0) {
      return res.json({ success: true, message: "No session cart to merge" });
    }

    if (!userCart) {
      // Create user cart from session cart
      userCart = new CartV3({
        userId,
        items: sessionCart.items,
        totals: sessionCart.totals,
        appliedCoupons: sessionCart.appliedCoupons,
      });
      await userCart.save();
    } else {
      // Merge items
      for (const sessionItem of sessionCart.items) {
        const existingItemIndex = userCart.items.findIndex(
          (item) =>
            item.productId.toString() === sessionItem.productId.toString() &&
            item.size === sessionItem.size
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          userCart.items[existingItemIndex].quantity += sessionItem.quantity;
          userCart.items[existingItemIndex].totalPrice =
            userCart.items[existingItemIndex].quantity *
            userCart.items[existingItemIndex].unitPrice;
        } else {
          // Add new item
          userCart.items.push(sessionItem);
        }
      }

      // Recalculate totals
      userCart.totals = calculateCartTotals(userCart.items);
      await userCart.save();
    }

    // Delete session cart
    await CartV3.findByIdAndDelete(sessionCart._id);

    // Populate cart items
    await userCart.populate({
      path: "items.productId",
      select: "name slug pricing images status visibility inventory sizes",
    });

    res.json({ success: true, cart: userCart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

