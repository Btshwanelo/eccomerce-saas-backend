const express = require("express");
const router = express.Router();
const userController = require("../../controllers/v2/userController");
const { protect, adminOnly } = require("../../middlewares/auth");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ==================== AUTH ROUTES ====================
// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// ==================== USER PROFILE ROUTES ====================
// Protected routes
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, upload.single("avatar"), userController.updateProfile);
router.put("/change-password", protect, userController.changePassword);

// ==================== ADDRESS ROUTES ====================
// Protected routes
router.get("/addresses", protect, userController.getAddresses);
router.post("/addresses", protect, userController.createAddress);
router.get("/addresses/:id", protect, userController.getAddressById);
router.put("/addresses/:id", protect, userController.updateAddress);
router.delete("/addresses/:id", protect, userController.deleteAddress);

// ==================== ADMIN ROUTES ====================
// Admin only routes
router.get("/", protect, adminOnly, userController.getUsers);
router.get("/:id", protect, adminOnly, userController.getUserById);
router.put("/:id", protect, adminOnly, upload.single("avatar"), userController.updateUser);
router.delete("/:id", protect, adminOnly, userController.deleteUser);

module.exports = router;

