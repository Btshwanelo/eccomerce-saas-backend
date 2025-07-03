const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/auth');

router.use(protect);

router.post('/', orderController.placeOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', adminOnly, orderController.updateOrderStatus);
router.delete('/:id', orderController.cancelOrder);

module.exports = router; 