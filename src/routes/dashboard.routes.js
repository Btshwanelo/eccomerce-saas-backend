const express = require('express');
const {
  getDashboardData
} = require('../../controllers/v2/dashboardController');
const { protect } = require('../../middlewares/auth');

const router = express.Router();
router.use(protect);

router.get('/', getDashboardData);

module.exports = router;