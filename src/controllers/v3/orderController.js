const {
  OrderV3,
  CartV3,
  ProductV3,
  AddressV3,
  PaymentV3,
  DeliveryOptionV3,
} = require("../../models/v3");

// Helper function to generate order number
const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

// Helper function to calculate order totals
const calculateOrderTotals = (
  items,
  shippingAmount = 0,
  discountAmount = 0
) => {
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const taxAmount = subtotal * 0.1; // 10% tax - should be configurable
  const total = subtotal + taxAmount + shippingAmount - discountAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    shippingAmount: Number(shippingAmount.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};

// Initiate checkout process
exports.initiateCheckout = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];

    // Get cart
    const cart = await CartV3.findOne({
      $or: [{ userId }, { sessionId }],
    }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Validate cart items
    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product not found for item: ${item.productId}`,
        });
      }

      // Check stock availability
      if (item.size) {
        const sizeObj = product.sizes.find((s) => s.name === item.size);
        if (!sizeObj || sizeObj.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for ${product.name} - size ${item.size}`,
          });
        }
      } else {
        if (product.inventory.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for ${product.name}`,
          });
        }
      }
    }

    // Get user addresses if authenticated
    let addresses = [];
    if (userId) {
      addresses = await AddressV3.find({ userId }).sort({
        isDefault: -1,
        createdAt: -1,
      });
    }

    // Calculate totals
    const totals = calculateOrderTotals(
      cart.items,
      cart.totals.shippingAmount,
      cart.totals.discountAmount
    );

    res.json({
      success: true,
      checkout: {
        cart: {
          items: cart.items,
          totals: cart.totals,
        },
        addresses,
        totals,
        orderNumber: generateOrderNumber(),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Validate checkout data
exports.validateCheckout = async (req, res) => {
  try {
    const { addressId, deliveryOptionId, paymentMethod } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];

    // Validate required fields
    if (!addressId) {
      return res.status(400).json({
        success: false,
        error: "Address is required",
      });
    }

    if (!deliveryOptionId) {
      return res.status(400).json({
        success: false,
        error: "Delivery option is required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: "Payment method is required",
      });
    }

    // Get cart
    const cart = await CartV3.findOne({
      $or: [{ userId }, { sessionId }],
    }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Validate address
    const address = await AddressV3.findById(addressId);
    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Address not found",
      });
    }

    // Check if address belongs to user (if authenticated)
    if (userId && address.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Address does not belong to user",
      });
    }

    // Validate cart items again
    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product not found for item: ${item.productId}`,
        });
      }

      // Check stock availability
      if (item.size) {
        const sizeObj = product.sizes.find((s) => s.name === item.size);
        if (!sizeObj || sizeObj.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for ${product.name} - size ${item.size}`,
          });
        }
      } else {
        if (product.inventory.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for ${product.name}`,
          });
        }
      }
    }

    // Calculate final totals
    const totals = calculateOrderTotals(
      cart.items,
      cart.totals.shippingAmount,
      cart.totals.discountAmount
    );

    res.json({
      success: true,
      validation: {
        valid: true,
        totals,
        orderNumber: generateOrderNumber(),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Complete checkout and create order
exports.completeCheckout = async (req, res) => {
  try {
    const { addressId, deliveryOptionId, paymentMethod, notes } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];

    // Get cart
    const cart = await CartV3.findOne({
      $or: [{ userId }, { sessionId }],
    }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Get address
    const address = await AddressV3.findById(addressId);
    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Address not found",
      });
    }

    // Check if address belongs to user (if authenticated)
    if (userId && address.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Address does not belong to user",
      });
    }

    // Get and validate delivery option
    const deliveryOption = await DeliveryOptionV3.findById(deliveryOptionId);
    if (!deliveryOption) {
      return res.status(400).json({
        success: false,
        error: "Delivery option not found",
      });
    }

    if (!deliveryOption.isActive) {
      return res.status(400).json({
        success: false,
        error: "Delivery option is not available",
      });
    }

    // Create order items
    const orderItems = cart.items.map((item) => {
      const unitPrice =
        item.productId.pricing?.salePrice ||
        item.productId.pricing?.basePrice;
      return {
        productId: item.productId._id,
        productName: item.productId.name,
        variantName: item.size || "",
        sku: item.productId.sku,
        quantity: item.quantity,
        unitPrice: unitPrice || 0,
        totalPrice: item.totalPrice,
      };
    });

    // Calculate totals with delivery option cost
    const totals = calculateOrderTotals(
      cart.items,
      deliveryOption.cost,
      cart.totals.discountAmount
    );

    // Get customer email
    const customerEmail = req.user?.email || "guest@example.com";

    // Create order
    const order = new OrderV3({
      orderNumber: generateOrderNumber(),
      userId: userId || null,
      customerEmail: customerEmail,
      items: orderItems,
      shippingAddress: {
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone || "",
      },
      billingAddress: {
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone || "",
      },
      totals: {
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        shippingAmount: totals.shippingAmount,
        discountAmount: totals.discountAmount,
        total: totals.total,
      },
      payment: {
        method: paymentMethod,
        status: "pending",
      },
      shipping: {
        method: deliveryOption.name,
        carrier: "Standard",
        estimatedDelivery: new Date(
          Date.now() + deliveryOption.estimatedDays.min * 24 * 60 * 60 * 1000
        ),
      },
      notes: notes || "",
      status: "pending",
    });

    await order.save();

    // Create payment record
    const payment = new PaymentV3({
      orderId: order._id,
      userId: userId || null,
      amount: totals.total,
      currency: "R",
      paymentMethod,
      status: "pending",
      paymentReference: `PAY-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`,
    });

    await payment.save();

    // Update product stock
    for (const item of cart.items) {
      const product = item.productId;

      if (item.size) {
        const sizeObj = product.sizes.find((s) => s.name === item.size);
        if (sizeObj) {
          sizeObj.stockQuantity -= item.quantity;
          sizeObj.stockStatus =
            sizeObj.stockQuantity <= 0 ? "out_of_stock" : "in_stock";
          await product.save();
        }
      } else {
        product.inventory.stockQuantity -= item.quantity;
        product.inventory.stockStatus =
          product.inventory.stockQuantity <= 0 ? "out_of_stock" : "in_stock";
        await product.save();
      }
    }

    // Clear cart
    await CartV3.findByIdAndDelete(cart._id);

    // Populate order for response
    await order.populate("items.productId");

    res.status(201).json({
      success: true,
      order,
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentReference: payment.paymentReference,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];
    const { page = 1, limit = 20, status } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    }

    if (status) {
      query.status = status;
    }

    const orders = await OrderV3.find(query)
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await OrderV3.countDocuments(query);

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
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];

    const order = await OrderV3.findById(id).populate("items.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if user has access to this order
    if (userId && order.userId && order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (sessionId && order.sessionId && order.sessionId !== sessionId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get order by order number
exports.getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];

    const order = await OrderV3.findOne({ orderNumber }).populate(
      "items.productId"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if user has access to this order
    if (userId && order.userId && order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (sessionId && order.sessionId && order.sessionId !== sessionId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];

    const order = await OrderV3.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if user has access to this order
    if (userId && order.userId && order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (sessionId && order.sessionId && order.sessionId !== sessionId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Check if order can be cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Order cannot be cancelled. Current status: ${order.status}`,
      });
    }

    // Update order status
    order.status = "cancelled";
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      const product = await ProductV3.findById(item.productId);
      if (product) {
        if (item.variantName) {
          const sizeObj = product.sizes.find((s) => s.name === item.variantName);
          if (sizeObj) {
            sizeObj.stockQuantity += item.quantity;
            sizeObj.stockStatus =
              sizeObj.stockQuantity > 0 ? "in_stock" : "out_of_stock";
            await product.save();
          }
        } else {
          product.inventory.stockQuantity += item.quantity;
          product.inventory.stockStatus =
            product.inventory.stockQuantity > 0 ? "in_stock" : "out_of_stock";
          await product.save();
        }
      }
    }

    // Update payment status if exists
    const payment = await PaymentV3.findOne({ orderId: order._id });
    if (payment) {
      payment.status = "cancelled";
      await payment.save();
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await OrderV3.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Update order status
    order.status = status;
    order.updatedAt = new Date();

    // Add status change reason if provided
    if (reason) {
      order.notes = order.notes
        ? `${order.notes}\nStatus changed to ${status}: ${reason}`
        : `Status changed to ${status}: ${reason}`;
    }

    await order.save();

    // Update payment status if order is delivered or cancelled
    const payment = await PaymentV3.findOne({ orderId: order._id });
    if (payment) {
      let paymentStatus = payment.status;

      if (status === "delivered") {
        paymentStatus = "completed";
      } else if (status === "cancelled" || status === "refunded") {
        paymentStatus = "refunded";
      }

      if (paymentStatus !== payment.status) {
        payment.status = paymentStatus;
        await payment.save();

        // Update order payment status
        order.payment.status = paymentStatus;
        await order.save();
      }
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

