const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get the current user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.json({ success: true, cart: cart || { user: req.user.id, items: [] } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Add an item to the cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update the quantity of an item in the cart
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ success: false, error: 'Product not in cart' });
    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Remove an item from the cart
exports.removeCartItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Clear the cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 