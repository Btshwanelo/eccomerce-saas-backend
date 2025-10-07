const { AddressV2 } = require("../../models/v2");

// Get user addresses
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    if (!userId && !guestId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: "User identification required",
      });
    }

    let query = {};
    if (userId) {
      query.userId = userId;
    } else if (guestId) {
      query.guestId = guestId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    }

    const addresses = await AddressV2.find(query).sort({
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
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    const address = await AddressV2.findById(id);

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

    if (guestId && address.guestId && address.guestId.toString() !== guestId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (sessionId && address.sessionId && address.sessionId !== sessionId) {
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
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
    } = req.body;
    console.log("userId", req.user._id);
    const userId = req.user?._id;
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !address1 ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Required fields: firstName, lastName, address1, city, state, postalCode, country",
      });
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      let query = {};
      if (userId) {
        query.userId = userId;
      } else if (guestId) {
        query.guestId = guestId;
      } else if (sessionId) {
        query.sessionId = sessionId;
      }

      await AddressV2.updateMany(query, { isDefault: false });
    }

    const address = new AddressV2({
      userId: userId || null,
      guestId: guestId || null,
      sessionId: sessionId || null,
      type: type || "shipping",
      firstName,
      lastName,
      company: company || "",
      addressLine1: address1,
      addressLine2: address2 || "",
      city,
      state,
      postalCode,
      country,
      phone: phone || "",
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
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
    } = req.body;

    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    const address = await AddressV2.findById(id);

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

    if (guestId && address.guestId && address.guestId.toString() !== guestId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (sessionId && address.sessionId && address.sessionId !== sessionId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // If this is set as default, unset other default addresses
    if (isDefault && !address.isDefault) {
      let query = {};
      if (userId) {
        query.userId = userId;
      } else if (guestId) {
        query.guestId = guestId;
      } else if (sessionId) {
        query.sessionId = sessionId;
      }

      await AddressV2.updateMany(
        { ...query, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    // Update address fields
    if (type !== undefined) address.type = type;
    if (firstName !== undefined) address.firstName = firstName;
    if (lastName !== undefined) address.lastName = lastName;
    if (company !== undefined) address.company = company;
    if (address1 !== undefined) address.address1 = address1;
    if (address2 !== undefined) address.address2 = address2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country !== undefined) address.country = country;
    if (phone !== undefined) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = isDefault;

    address.updatedAt = new Date();
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
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    const address = await AddressV2.findById(id);

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

    if (guestId && address.guestId && address.guestId.toString() !== guestId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (sessionId && address.sessionId && address.sessionId !== sessionId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    await AddressV2.findByIdAndDelete(id);

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
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    const address = await AddressV2.findById(id);

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

    if (guestId && address.guestId && address.guestId.toString() !== guestId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (sessionId && address.sessionId && address.sessionId !== sessionId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Unset other default addresses
    let query = {};
    if (userId) {
      query.userId = userId;
    } else if (guestId) {
      query.guestId = guestId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    }

    await AddressV2.updateMany(
      { ...query, _id: { $ne: id } },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    address.updatedAt = new Date();
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
    const sessionId = req.headers["x-session-id"];
    const guestId = req.headers["x-guest-id"];

    let query = { isDefault: true };
    if (userId) {
      query.userId = userId;
    } else if (guestId) {
      query.guestId = guestId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    }

    const address = await AddressV2.findOne(query);

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
