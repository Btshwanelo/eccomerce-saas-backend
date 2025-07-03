const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const DeliveryOption = require('../models/DeliveryOption');

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const { addressId, deliveryOptionId } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }
    const address = await Address.findOne({ _id: addressId, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }
    const deliveryOption = await DeliveryOption.findById(deliveryOptionId);
    if (!deliveryOption) {
      return res.status(404).json({ success: false, error: 'Delivery option not found' });
    }
    // Calculate total
    let total = 0;
    const items = cart.items.map(item => {
      const price = item.product.price;
      total += price * item.quantity;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price
      };
    });
    total += deliveryOption.price;
    // Create order
    const order = new Order({
      user: req.user.id,
      items,
      address: address._id,
      deliveryOption: deliveryOption._id,
      total
    });
    await order.save();
    // Clear cart
    cart.items = [];
    await cart.save();
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all orders for the user
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .populate('address')
      .populate('deliveryOption')
      .sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a specific order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product')
      .populate('address')
      .populate('deliveryOption');
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update order status (admin/system)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Cancel an order (user or admin)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 