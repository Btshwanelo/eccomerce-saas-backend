const {
  OrderV2,
  CartV2,
  ProductV2,
  ProductVariantV2,
  AddressV2,
  PaymentV2,
  DeliveryOptionV2,
} = require("../../models/v2");
const crypto = require("crypto");
const querystring = require("querystring");

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
    const guestId = req.headers["x-guest-id"];

    // Get cart
    const cart = await CartV2.findOne({
      $or: [{ userId }, { sessionId }, { guestId }],
    }).populate("items.productId items.variantId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Validate cart items
    for (const item of cart.items) {
      const product = item.productId;
      const variant = item.variantId;

      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product not found for item: ${item.productId}`,
        });
      }

      // Check stock availability
      if (variant) {
        if (variant.inventory.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for ${product.name} - ${variant.sku}`,
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
      addresses = await AddressV2.find({ userId }).sort({
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
    const guestId = req.headers["x-guest-id"];

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
    const cart = await CartV2.findOne({
      $or: [{ userId }, { sessionId }, { guestId }],
    }).populate("items.productId items.variantId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Validate address
    const address = await AddressV2.findById(addressId);
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
      const variant = item.variantId;

      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product not found for item: ${item.productId}`,
        });
      }

      // Check stock availability
      if (variant) {
        if (variant.inventory.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for ${product.name} - ${variant.sku}`,
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
    const userId = req.user?._id;
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    // Get cart
    const cart = await CartV2.findOne({
      $or: [{ userId }, { sessionId }, { guestId }],
    }).populate("items.productId items.variantId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Get address
    const address = await AddressV2.findById(addressId);
    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Address not found",
      });
    }

    // Check if address belongs to user (if authenticated)
    if (userId.toString() && address.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Address does not belong to user",
      });
    }

    // Get and validate delivery option
    const deliveryOption = await DeliveryOptionV2.findById(deliveryOptionId);
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
        item.variantId?.pricing?.salePrice ||
        item.variantId?.pricing?.basePrice ||
        item.productId.pricing?.salePrice ||
        item.productId.pricing?.basePrice;
      return {
        productId: item.productId._id,
        variantId: item.variantId?._id,
        productName: item.productId.name,
        variantName: item.variantId
          ? `${item.variantId.colorId?.name || ""} ${
              item.variantId.sizeId?.name || ""
            }`.trim()
          : "",
        sku: item.variantId?.sku || item.productId.sku,
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
    const order = new OrderV2({
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
        phone: address.phone,
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
        phone: address.phone,
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
    const payment = new PaymentV2({
      orderId: order._id,
      userId: userId || null,
      guestId: guestId || null,
      amount: totals.total,
      currency: "USD",
      paymentMethod,
      status: "pending",
      paymentReference: `PAY-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`,
    });

    await payment.save();

    // Update order with payment reference
    order.paymentId = payment._id;
    await order.save();

    // Update product stock
    for (const item of cart.items) {
      const product = item.productId;
      const variant = item.variantId;

      if (variant) {
        variant.inventory.stockQuantity -= item.quantity;
        variant.inventory.stockStatus =
          variant.inventory.stockQuantity <= 0 ? "out_of_stock" : "in_stock";
        await variant.save();
      } else {
        product.inventory.stockQuantity -= item.quantity;
        product.inventory.stockStatus =
          product.inventory.stockQuantity <= 0 ? "out_of_stock" : "in_stock";
        await product.save();
      }
    }

    // Clear cart
    await CartV2.findByIdAndDelete(cart._id);

    // Populate order for response
    await order.populate("items.productId items.variantId");

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
    const guestId = req.headers["x-guest-id"];
    const { page = 1, limit = 20, status } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (userId) {
      query.userId = userId;
    } else if (guestId) {
      query.guestId = guestId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    }

    if (status) {
      query.status = status;
    }

    const orders = await OrderV2.find(query)
      .populate("items.productId items.variantId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await OrderV2.countDocuments(query);

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
    const guestId = req.headers["x-guest-id"];

    const order = await OrderV2.findById(id).populate(
      "items.productId items.variantId"
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

    if (guestId && order.guestId && order.guestId.toString() !== guestId) {
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
    const guestId = req.headers["x-guest-id"];

    const order = await OrderV2.findOne({ orderNumber }).populate(
      "items.productId items.variantId"
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

    if (guestId && order.guestId && order.guestId.toString() !== guestId) {
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
    const guestId = req.headers["x-guest-id"];

    const order = await OrderV2.findById(id);

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

    if (guestId && order.guestId && order.guestId.toString() !== guestId) {
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
    order.cancelledAt = new Date();
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      if (item.variantId) {
        const variant = await ProductVariantV2.findById(item.variantId);
        if (variant) {
          variant.inventory.stockQuantity += item.quantity;
          variant.inventory.stockStatus =
            variant.inventory.stockQuantity > 0 ? "in_stock" : "out_of_stock";
          await variant.save();
        }
      } else {
        const product = await ProductV2.findById(item.productId);
        if (product) {
          product.inventory.stockQuantity += item.quantity;
          product.inventory.stockStatus =
            product.inventory.stockQuantity > 0 ? "in_stock" : "out_of_stock";
          await product.save();
        }
      }
    }

    // Update payment status if exists
    if (order.paymentId) {
      await PaymentV2.findByIdAndUpdate(order.paymentId, {
        status: "cancelled",
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

// Get payment URL for order
exports.getPaymentUrl = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    const order = await OrderV2.findOne({
      _id: orderId,
      $or: [{ userId }, { sessionId }, { guestId }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // For now, return a mock payment URL
    // In a real implementation, this would integrate with payment gateways like Stripe, PayPal, etc.
    const paymentUrl = `https://payment.example.com/pay/${order.paymentId}`;

    res.json({
      success: true,
      paymentUrl,
      orderId: order._id,
      amount: order.totals.total,
      currency: "USD",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Verify payment status
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    const payment = await PaymentV2.findOne({
      _id: paymentId,
      $or: [{ userId }, { sessionId }, { guestId }],
    }).populate("orderId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        orderId: payment.orderId._id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentReference: payment.paymentReference,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
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

    const order = await OrderV2.findById(id);

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
    if (order.paymentId) {
      let paymentStatus = order.payment.status;

      if (status === "delivered") {
        paymentStatus = "paid";
      } else if (status === "cancelled" || status === "refunded") {
        paymentStatus = "refunded";
      }

      if (paymentStatus !== order.payment.status) {
        await PaymentV2.findByIdAndUpdate(order.paymentId, {
          status: paymentStatus,
          updatedAt: new Date(),
        });

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
