const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middlewares/auth");

// Admin-only routes
router.get("/", protect, adminOnly, analyticsController.getAnalytics);

module.exports = router;
