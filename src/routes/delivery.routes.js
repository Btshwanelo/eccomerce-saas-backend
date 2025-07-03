const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect, adminOnly } = require('../middlewares/auth');

// Address routes (protected)
router.post('/address', protect, deliveryController.createAddress);
router.get('/address', protect, deliveryController.getAddresses);
router.get('/address/:id', protect, deliveryController.getAddressById);
router.put('/address/:id', protect, deliveryController.updateAddress);
router.delete('/address/:id', protect, deliveryController.deleteAddress);

// Delivery option routes (admin only)
router.post('/option', protect, adminOnly, deliveryController.createDeliveryOption);
router.get('/option', deliveryController.getDeliveryOptions);
router.get('/option/:id', deliveryController.getDeliveryOptionById);
router.put('/option/:id', protect, adminOnly, deliveryController.updateDeliveryOption);
router.delete('/option/:id', protect, adminOnly, deliveryController.deleteDeliveryOption);

module.exports = router; 