const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);
router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password/:resettoken", authController.resetPassword);
router.get("/reset-password/:resettoken", authController.verifyResetToken);

// Protected routes
router.get("/me", protect, authController.getMe);
router.get("/logout", protect, authController.logout);

module.exports = router;
