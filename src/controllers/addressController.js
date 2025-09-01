const Address = require("../models/Address");

// Create an address
exports.createAddress = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // If this is set as default, unset all other default addresses for this user
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const address = new Address({
      user: req.user.id,
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    });

    await address.save();
    res.status(201).json({ success: true, address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all addresses for current user
exports.getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    }); // Default first, then by creation date
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all addresses (Admin only)
exports.getAllAddresses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const addresses = await Address.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Address.countDocuments();

    res.json({
      success: true,
      addresses,
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

// Get an address by ID
exports.getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, error: "Address not found" });
    }

    // Check if user owns this address (unless admin)
    if (req.user.role !== "admin" && address.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    res.json({ success: true, address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get user's default address
exports.getDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      user: req.user.id,
      isDefault: true,
    });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, error: "No default address found" });
    }
    res.json({ success: true, address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update an address
exports.updateAddress = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const address = await Address.findById(req.params.id);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, error: "Address not found" });
    }

    // Check if user owns this address (unless admin)
    if (req.user.role !== "admin" && address.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // If this is being set as default, unset all other default addresses for this user
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { user: address.user, _id: { $ne: address._id } },
        { isDefault: false }
      );
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault,
      },
      { new: true }
    );

    res.json({ success: true, address: updatedAddress });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Set address as default
exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, error: "Address not found" });
    }

    // Check if user owns this address
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Unset all other default addresses for this user
    await Address.updateMany({ user: req.user.id }, { isDefault: false });

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.json({ success: true, address, message: "Address set as default" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, error: "Address not found" });
    }

    // Check if user owns this address (unless admin)
    if (req.user.role !== "admin" && address.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Check if address is being used in any orders
    const Order = require("../models/Order");
    const orderCount = await Order.countDocuments({ address: req.params.id });

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete address. It is used in ${orderCount} order(s).`,
      });
    }

    await Address.findByIdAndDelete(req.params.id);

    // If this was the default address, set another address as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: address.user });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({ success: true, message: "Address deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get addresses by user ID (Admin only)
exports.getAddressesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.find({ user: userId })
      .populate("user", "name email")
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({ success: true, addresses });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
