const Address = require('../models/Address');
const DeliveryOption = require('../models/DeliveryOption');

// Address methods
exports.createAddress = async (req, res) => {
  try {
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;
    const address = new Address({
      user: req.user.id,
      name,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: !!isDefault
    });
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }
    await address.save();
    res.status(201).json({ success: true, address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ success: false, error: 'Address not found' });
    res.json({ success: true, address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, phone, street, city, state, postalCode, country, isDefault: !!isDefault },
      { new: true }
    );
    if (!address) return res.status(404).json({ success: false, error: 'Address not found' });
    res.json({ success: true, address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ success: false, error: 'Address not found' });
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delivery option methods
exports.createDeliveryOption = async (req, res) => {
  try {
    const { name, description, price, estimatedTime } = req.body;
    const option = new DeliveryOption({ name, description, price, estimatedTime });
    await option.save();
    res.status(201).json({ success: true, option });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getDeliveryOptions = async (req, res) => {
  try {
    const options = await DeliveryOption.find();
    res.json({ success: true, options });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getDeliveryOptionById = async (req, res) => {
  try {
    const option = await DeliveryOption.findById(req.params.id);
    if (!option) return res.status(404).json({ success: false, error: 'Delivery option not found' });
    res.json({ success: true, option });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateDeliveryOption = async (req, res) => {
  try {
    const { name, description, price, estimatedTime } = req.body;
    const option = await DeliveryOption.findByIdAndUpdate(
      req.params.id,
      { name, description, price, estimatedTime },
      { new: true }
    );
    if (!option) return res.status(404).json({ success: false, error: 'Delivery option not found' });
    res.json({ success: true, option });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteDeliveryOption = async (req, res) => {
  try {
    const option = await DeliveryOption.findByIdAndDelete(req.params.id);
    if (!option) return res.status(404).json({ success: false, error: 'Delivery option not found' });
    res.json({ success: true, message: 'Delivery option deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 