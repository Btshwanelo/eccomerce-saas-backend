const Order = require("../models/Order");

// Create an order
exports.createOrder = async (req, res) => {
  try {
    const { items, address, deliveryOption, total } = req.body;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const order = new Order({
      orderNumber,
      user: req.user.id,
      items,
      address,
      deliveryOption,
      total,
    });

    await order.save();
    await order.populate([
      "items.product",
      "address",
      "deliveryOption",
      "user",
    ]);

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .populate(["items.product", "address", "deliveryOption", "user"])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id };
    if (status) query.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .populate(["items.product", "address", "deliveryOption"])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate([
      "items.product",
      "address",
      "deliveryOption",
      "user",
      "payment",
    ]);

    if (!order)
      return res.status(404).json({ success: false, error: "Order not found" });

    // Check if user owns this order (unless admin)
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get order by order number
exports.getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
    }).populate([
      "items.product",
      "address",
      "deliveryOption",
      "user",
      "payment",
    ]);

    if (!order)
      return res.status(404).json({ success: false, error: "Order not found" });

    // Check if user owns this order (unless admin)
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, error: "Order not found" });

    order.status = status;
    order.updatedAt = Date.now();

    // Set timestamps based on status
    if (status === "confirmed" && !order.confirmedAt) {
      order.confirmedAt = new Date();
    } else if (status === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    } else if (status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();
    await order.populate([
      "items.product",
      "address",
      "deliveryOption",
      "user",
    ]);

    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, error: "Order not found" });

    // Check if user owns this order (unless admin)
    if (req.user.role !== "admin" && order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Can only cancel pending or confirmed orders
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: "Order cannot be cancelled in current status",
      });
    }

    order.status = "cancelled";
    order.updatedAt = Date.now();
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete order (Admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, error: "Order not found" });
    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get order statistics (Admin only)
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ]);

    const recentOrders = await Order.find()
      .populate(["items.product", "user"])
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalOrders,
        ordersByStatus,
        recentOrders,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
