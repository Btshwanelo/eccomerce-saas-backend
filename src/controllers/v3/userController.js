const { UserV3, AddressV3 } = require("../../models/v3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  uploadFileToStorage,
  validateImageFile,
} = require("../../utils/uploadFile");

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d",
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, role, profile, preferences } = req.body;

    // Check if user already exists
    const existingUser = await UserV3.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new UserV3({
      email,
      password: hashedPassword,
      role: role || "customer",
      profile,
      preferences,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      user: userResponse,
      token,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserV3.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      user: userResponse,
      token,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await UserV3.findById(req.user.userId)
      .populate("addresses")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (profile) updateData.profile = profile;
    if (preferences) updateData.preferences = preferences;

    // Handle avatar upload
    if (req.file) {
      try {
        validateImageFile(req.file);
        const uploadResult = await uploadFileToStorage(req.file);
        if (!updateData.profile) updateData.profile = {};
        updateData.profile.avatar = uploadResult.downloadUrl;
      } catch (uploadError) {
        console.error("Avatar upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          error: `Failed to upload avatar: ${uploadError.message}`,
        });
      }
    }

    const user = await UserV3.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await UserV3.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      role,
      status,
      search,
    } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const users = await UserV3.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await UserV3.countDocuments(filter);

    res.json({
      success: true,
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await UserV3.findById(req.params.id)
      .populate("addresses")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { role, status, profile, preferences } = req.body;
    const userId = req.params.id;

    const updateData = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (profile) updateData.profile = profile;
    if (preferences) updateData.preferences = preferences;

    // Handle avatar upload
    if (req.file) {
      try {
        validateImageFile(req.file);
        const uploadResult = await uploadFileToStorage(req.file);
        if (!updateData.profile) updateData.profile = {};
        updateData.profile.avatar = uploadResult.downloadUrl;
      } catch (uploadError) {
        console.error("Avatar upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          error: `Failed to upload avatar: ${uploadError.message}`,
        });
      }
    }

    const user = await UserV3.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await UserV3.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Also delete associated addresses
    await AddressV3.deleteMany({ userId: user._id });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ==================== ADDRESS CONTROLLERS ====================

// Create address
exports.createAddress = async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      userId: req.user.userId,
    };

    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await AddressV3.updateMany(
        { userId: req.user.userId },
        { isDefault: false }
      );
    }

    const address = new AddressV3(addressData);
    await address.save();

    res.status(201).json({ success: true, address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get user addresses
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await AddressV3.find({ userId: req.user.userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json({ success: true, addresses });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get address by ID
exports.getAddressById = async (req, res) => {
  try {
    const address = await AddressV3.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    res.json({ success: true, address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const addressData = req.body;

    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await AddressV3.updateMany(
        { userId: req.user.userId },
        { isDefault: false }
      );
    }

    const address = await AddressV3.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      addressData,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    res.json({ success: true, address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const address = await AddressV3.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

