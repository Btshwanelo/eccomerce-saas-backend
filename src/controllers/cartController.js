const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) {
      return res.json({ success: true, cart: { items: [], total: 0 } });
    }
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        priceAtTime: product.salePrice || product.price,
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update item quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Item not found in cart" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get cart item count
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    const count = cart
      ? cart.items.reduce((total, item) => total + item.quantity, 0)
      : 0;
    res.json({ success: true, count });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Calculate cart total
exports.getCartTotal = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) {
      return res.json({ success: true, total: 0 });
    }

    const total = cart.items.reduce((sum, item) => {
      const price =
        item.priceAtTime || item.product.salePrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    res.json({ success: true, total });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
