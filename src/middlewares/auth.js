const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { UserV2 } = require("../models/v2");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Try to find user in v2 model first, then fallback to v1
    let user = await UserV2.findById(decoded.userId || decoded.id);
    if (!user) {
      user = await User.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route",
    });
  }
});

exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      
      // Try to find user in v2 model first, then fallback to v1
      let user = await UserV2.findById(decoded.userId || decoded.id);
      if (!user) {
        user = await User.findById(decoded.id);
      }
      
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Token is invalid, but we continue without authentication
      // This allows guest users to access the endpoint
    }
  }
  
  next();
});

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, error: "Admin access required" });
  }
  next();
};
