const { AddressV3 } = require("../../models/v3");

// Get user addresses
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User identification required",
      });
    }

    const addresses = await AddressV3.find({ userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      addresses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get address by ID
exports.getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const address = await AddressV3.findById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    // Check if user has access to this address
    if (userId && address.userId && address.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      address,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Create new address
exports.createAddress = async (req, res) => {
  try {
    const {
      type,
      firstName,
      lastName,
      company,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User identification required",
      });
    }

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Required fields: firstName, lastName, addressLine1, city, state, postalCode, country",
      });
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await AddressV3.updateMany({ userId }, { isDefault: false });
    }

    const address = new AddressV3({
      userId,
      type: type || "both",
      firstName,
      lastName,
      company: company || "",
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false,
    });

    await address.save();

    res.status(201).json({
      success: true,
      address,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      firstName,
      lastName,
      company,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const userId = req.user?.userId;

    const address = await AddressV3.findById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    // Check if user has access to this address
    if (userId && address.userId && address.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // If this is set as default, unset other default addresses
    if (isDefault && !address.isDefault) {
      await AddressV3.updateMany(
        { userId, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    // Update address fields
    if (type !== undefined) address.type = type;
    if (firstName !== undefined) address.firstName = firstName;
    if (lastName !== undefined) address.lastName = lastName;
    if (company !== undefined) address.company = company;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country !== undefined) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.json({
      success: true,
      address,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const address = await AddressV3.findById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    // Check if user has access to this address
    if (userId && address.userId && address.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    await AddressV3.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const address = await AddressV3.findById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    // Check if user has access to this address
    if (userId && address.userId && address.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Unset other default addresses
    await AddressV3.updateMany(
      { userId, _id: { $ne: id } },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      address,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get default address
exports.getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User identification required",
      });
    }

    const address = await AddressV3.findOne({ userId, isDefault: true });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "No default address found",
      });
    }

    res.json({
      success: true,
      address,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

