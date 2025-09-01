const DeliveryOption = require("../models/DeliveryOption");

// Create a delivery option
exports.createDeliveryOption = async (req, res) => {
  try {
    const { name, description, price, estimatedDays } = req.body;

    const deliveryOption = new DeliveryOption({
      name,
      description,
      price,
      estimatedDays,
    });

    await deliveryOption.save();
    res.status(201).json({ success: true, deliveryOption });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all delivery options
exports.getDeliveryOptions = async (req, res) => {
  try {
    const deliveryOptions = await DeliveryOption.find({ isActive: true }).sort({
      price: 1,
    }); // Sort by price ascending
    res.json({ success: true, deliveryOptions });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all delivery options (including inactive) - Admin only
exports.getAllDeliveryOptions = async (req, res) => {
  try {
    const deliveryOptions = await DeliveryOption.find().sort({
      isActive: -1,
      price: 1,
    }); // Active first, then by price
    res.json({ success: true, deliveryOptions });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a delivery option by ID
exports.getDeliveryOptionById = async (req, res) => {
  try {
    const deliveryOption = await DeliveryOption.findById(req.params.id);
    if (!deliveryOption) {
      return res
        .status(404)
        .json({ success: false, error: "Delivery option not found" });
    }
    res.json({ success: true, deliveryOption });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get available delivery options based on cart total
exports.getAvailableDeliveryOptions = async (req, res) => {
  try {
    const { cartTotal = 0 } = req.query;
    const total = parseFloat(cartTotal);

    const deliveryOptions = await DeliveryOption.find({ isActive: true }).sort({
      price: 1,
    });

    // Calculate actual price based on free threshold
    const availableOptions = deliveryOptions.map((option) => ({
      ...option.toObject(),
      actualPrice:
        option.freeThreshold && total >= option.freeThreshold
          ? 0
          : option.price,
      isFree: option.freeThreshold && total >= option.freeThreshold,
    }));

    res.json({
      success: true,
      deliveryOptions: availableOptions,
      cartTotal: total,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a delivery option
exports.updateDeliveryOption = async (req, res) => {
  try {
    const { name, description, price, estimatedDays, isActive } = req.body;

    const deliveryOption = await DeliveryOption.findByIdAndUpdate(
      req.params.id,
      { name, description, price, estimatedDays, isActive },
      { new: true }
    );

    if (!deliveryOption) {
      return res
        .status(404)
        .json({ success: false, error: "Delivery option not found" });
    }

    res.json({ success: true, deliveryOption });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a delivery option
exports.deleteDeliveryOption = async (req, res) => {
  try {
    // Check if delivery option is being used in any orders
    const Order = require("../models/Order");
    const orderCount = await Order.countDocuments({
      deliveryOption: req.params.id,
    });

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete delivery option. It is used in ${orderCount} order(s).`,
      });
    }

    const deliveryOption = await DeliveryOption.findByIdAndDelete(
      req.params.id
    );
    if (!deliveryOption) {
      return res
        .status(404)
        .json({ success: false, error: "Delivery option not found" });
    }

    res.json({ success: true, message: "Delivery option deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Toggle delivery option status
exports.toggleDeliveryOptionStatus = async (req, res) => {
  try {
    const deliveryOption = await DeliveryOption.findById(req.params.id);
    if (!deliveryOption) {
      return res
        .status(404)
        .json({ success: false, error: "Delivery option not found" });
    }

    deliveryOption.isActive = !deliveryOption.isActive;
    await deliveryOption.save();

    res.json({
      success: true,
      deliveryOption,
      message: `Delivery option ${
        deliveryOption.isActive ? "activated" : "deactivated"
      }`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get delivery option usage statistics
exports.getDeliveryOptionStats = async (req, res) => {
  try {
    const Order = require("../models/Order");

    const stats = await Order.aggregate([
      {
        $lookup: {
          from: "deliveryoptions",
          localField: "deliveryOption",
          foreignField: "_id",
          as: "deliveryInfo",
        },
      },
      { $unwind: "$deliveryInfo" },
      {
        $group: {
          _id: "$deliveryOption",
          name: { $first: "$deliveryInfo.name" },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$deliveryInfo.price" },
        },
      },
      { $sort: { orderCount: -1 } },
    ]);

    res.json({ success: true, stats });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
