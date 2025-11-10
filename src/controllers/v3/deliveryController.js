const { DeliveryOptionV3 } = require("../../models/v3");

// Get all delivery options
exports.getDeliveryOptions = async (req, res) => {
  try {
    const { region, minCost, maxCost, type, isActive = true } = req.query;

    let query = { isActive };

    // Filter by region if specified
    if (region) {
      query.$or = [
        { regions: { $in: [region] } },
        { regions: { $in: ['all'] } }
      ];
    }

    // Filter by cost range
    if (minCost || maxCost) {
      query.cost = {};
      if (minCost) query.cost.$gte = parseFloat(minCost);
      if (maxCost) query.cost.$lte = parseFloat(maxCost);
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    const deliveryOptions = await DeliveryOptionV3.find(query)
      .sort({ cost: 1, estimatedDays: 1 });

    res.json({
      success: true,
      deliveryOptions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get delivery option by ID
exports.getDeliveryOptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const deliveryOption = await DeliveryOptionV3.findById(id);

    if (!deliveryOption) {
      return res.status(404).json({
        success: false,
        error: 'Delivery option not found'
      });
    }

    res.json({
      success: true,
      deliveryOption
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get available delivery options for order (based on cart total, weight, etc.)
exports.getAvailableDeliveryOptions = async (req, res) => {
  try {
    const { cartTotal, weight, region } = req.query;

    let query = { isActive: true };
    const andConditions = [];

    // Filter by region if specified
    if (region) {
      andConditions.push({
        $or: [
          { regions: { $in: [region.toLowerCase(), region] } },
          { regions: { $in: ['all', 'All', 'ALL'] } }
        ]
      });
    }

    // Filter by weight limit
    if (weight) {
      andConditions.push({
        $or: [
          { weightLimit: null },
          { weightLimit: { $gte: parseFloat(weight) } }
        ]
      });
    }

    // Combine all conditions
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    let deliveryOptions = await DeliveryOptionV3.find(query)
      .sort({ cost: 1, estimatedDays: 1 });

    // Apply free shipping logic
    if (cartTotal) {
      const total = parseFloat(cartTotal);
      deliveryOptions = deliveryOptions.map(option => {
        let finalCost = option.cost;
        
        // Check if free shipping threshold is met
        if (option.freeShippingThreshold && total >= option.freeShippingThreshold) {
          finalCost = 0;
        }

        return {
          ...option.toObject(),
          originalCost: option.cost,
          finalCost,
          isFreeShipping: finalCost === 0 && option.cost > 0
        };
      });
    }

    res.json({
      success: true,
      deliveryOptions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Create delivery option (Admin only)
exports.createDeliveryOption = async (req, res) => {
  try {
    const {
      name,
      description,
      cost,
      estimatedDays,
      estimatedDeliveryTime,
      type,
      isActive,
      regions,
      weightLimit,
      freeShippingThreshold,
      trackingSupported
    } = req.body;

    // Validate required fields
    if (!name || cost === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name and cost are required'
      });
    }

    const deliveryOption = new DeliveryOptionV3({
      name,
      description: description || '',
      cost,
      estimatedDays: estimatedDays || { min: 1, max: 7 },
      estimatedDeliveryTime: estimatedDeliveryTime || '1-7 business days',
      type: type || 'standard',
      isActive: isActive !== undefined ? isActive : true,
      regions: regions || ['all'],
      weightLimit: weightLimit || null,
      freeShippingThreshold: freeShippingThreshold || null,
      trackingSupported: trackingSupported !== undefined ? trackingSupported : true
    });

    await deliveryOption.save();

    res.status(201).json({
      success: true,
      deliveryOption
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Update delivery option (Admin only)
exports.updateDeliveryOption = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      cost,
      estimatedDays,
      estimatedDeliveryTime,
      type,
      isActive,
      regions,
      weightLimit,
      freeShippingThreshold,
      trackingSupported
    } = req.body;

    const deliveryOption = await DeliveryOptionV3.findById(id);

    if (!deliveryOption) {
      return res.status(404).json({
        success: false,
        error: 'Delivery option not found'
      });
    }

    // Update fields
    if (name !== undefined) deliveryOption.name = name;
    if (description !== undefined) deliveryOption.description = description;
    if (cost !== undefined) deliveryOption.cost = cost;
    if (estimatedDays !== undefined) deliveryOption.estimatedDays = estimatedDays;
    if (estimatedDeliveryTime !== undefined) deliveryOption.estimatedDeliveryTime = estimatedDeliveryTime;
    if (type !== undefined) deliveryOption.type = type;
    if (isActive !== undefined) deliveryOption.isActive = isActive;
    if (regions !== undefined) deliveryOption.regions = regions;
    if (weightLimit !== undefined) deliveryOption.weightLimit = weightLimit;
    if (freeShippingThreshold !== undefined) deliveryOption.freeShippingThreshold = freeShippingThreshold;
    if (trackingSupported !== undefined) deliveryOption.trackingSupported = trackingSupported;

    deliveryOption.updatedAt = new Date();
    await deliveryOption.save();

    res.json({
      success: true,
      deliveryOption
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Delete delivery option (Admin only)
exports.deleteDeliveryOption = async (req, res) => {
  try {
    const { id } = req.params;

    const deliveryOption = await DeliveryOptionV3.findById(id);

    if (!deliveryOption) {
      return res.status(404).json({
        success: false,
        error: 'Delivery option not found'
      });
    }

    await DeliveryOptionV3.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Delivery option deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Toggle delivery option status (Admin only)
exports.toggleDeliveryOptionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const deliveryOption = await DeliveryOptionV3.findById(id);

    if (!deliveryOption) {
      return res.status(404).json({
        success: false,
        error: 'Delivery option not found'
      });
    }

    deliveryOption.isActive = !deliveryOption.isActive;
    deliveryOption.updatedAt = new Date();
    await deliveryOption.save();

    res.json({
      success: true,
      deliveryOption
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

