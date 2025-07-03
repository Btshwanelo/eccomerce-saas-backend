const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middlewares/auth');

router.use(protect);

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id/status', adminOnly, paymentController.updatePaymentStatus);
router.post('/payfast-url', paymentController.getPayfastUrl);
router.post('/payfast-itn', paymentController.payfastItn);

module.exports = router; 