const Payment = require('../models/Payment');
const Order = require('../models/Order');
const config = require('../config/environment');
const crypto = require('crypto');
const querystring = require('querystring');

// Create a payment for an order
exports.createPayment = async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.total !== amount) return res.status(400).json({ success: false, error: 'Amount mismatch' });
    const payment = new Payment({
      user: req.user.id,
      order: order._id,
      amount,
      method,
      status: 'pending'
    });
    await payment.save();
    order.payment = payment._id;
    await order.save();
    res.status(201).json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all payments for the user
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).populate('order').sort('-createdAt');
    res.json({ success: true, payments });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a specific payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, user: req.user.id }).populate('order');
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
    res.json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update payment status (admin/webhook)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
    // If payment completed, update order status
    if (status === 'completed') {
      await Order.findByIdAndUpdate(payment.order, { status: 'paid' });
    }
    res.json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Generate PayFast payment URL for an order
exports.getPayfastUrl = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user.id }).populate('items.product');
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    // Prepare PayFast data
    const pfData = {
      merchant_id: config.payfast.merchantId,
      merchant_key: config.payfast.merchantKey,
      return_url: config.payfast.returnUrl,
      cancel_url: config.payfast.cancelUrl,
      notify_url: config.payfast.notifyUrl,
      amount: order.total.toFixed(2),
      item_name: `Order #${order._id}`,
      email_address: req.user.email
    };
    // Create signature if passphrase is set
    let pfString = Object.keys(pfData)
      .map(key => `${key}=${encodeURIComponent(pfData[key])}`)
      .join('&');
    if (config.payfast.passphrase) {
      pfString += `&passphrase=${encodeURIComponent(config.payfast.passphrase)}`;
    }
    const signature = crypto.createHash('md5').update(pfString).digest('hex');
    pfData.signature = signature;
    // Build PayFast URL
    const payfastUrl = `https://www.payfast.co.za/eng/process?${querystring.stringify(pfData)}`;
    res.json({ success: true, url: payfastUrl });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// PayFast ITN (webhook) handler
exports.payfastItn = async (req, res) => {
  try {
    // PayFast sends x-www-form-urlencoded
    const pfData = req.body;
    // 1. Validate signature
    const config = require('../config/environment');
    let pfString = Object.keys(pfData)
      .filter(key => key !== 'signature')
      .sort()
      .map(key => `${key}=${encodeURIComponent(pfData[key])}`)
      .join('&');
    if (config.payfast.passphrase) {
      pfString += `&passphrase=${encodeURIComponent(config.payfast.passphrase)}`;
    }
    const signature = require('crypto').createHash('md5').update(pfString).digest('hex');
    if (signature !== pfData.signature) {
      console.error('PayFast ITN signature mismatch');
      return res.status(200).send('Invalid signature'); // Always 200 to PayFast
    }
    // 2. Find payment by order ID
    const orderId = pfData.m_payment_id;
    const payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      console.error('PayFast ITN: Payment not found for order', orderId);
      return res.status(200).send('Payment not found');
    }
    // 3. Update payment and order status
    if (pfData.payment_status === 'COMPLETE') {
      payment.status = 'completed';
      await payment.save();
      await Order.findByIdAndUpdate(payment.order, { status: 'paid' });
    } else if (pfData.payment_status === 'FAILED' || pfData.payment_status === 'CANCELLED') {
      payment.status = 'failed';
      await payment.save();
      await Order.findByIdAndUpdate(payment.order, { status: 'cancelled' });
    }
    // 4. Always respond 200 OK
    res.status(200).send('ITN received');
  } catch (err) {
    console.error('PayFast ITN error:', err);
    res.status(200).send('Error'); // Always 200 to PayFast
  }
}; 