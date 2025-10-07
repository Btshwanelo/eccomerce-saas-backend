const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, adminOnly } = require("../middlewares/auth");

// Admin-only routes for user management
router.get("/", protect, adminOnly, userController.getAllUsers);
router.get("/:id", protect, adminOnly, userController.getUserById);
router.put("/:id", protect, adminOnly, userController.updateUser);
router.delete("/:id", protect, adminOnly, userController.deleteUser);
router.put("/:id/role", protect, adminOnly, userController.updateUserRole);

module.exports = router;
