const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protectUser, protectCustomer } = require('../middleware/auth');

// Staff lookup & quick create
router.get('/lookup', customerController.lookupByPhone);
router.post('/quick-create', customerController.quickCreateCustomer);

// Profile & Loyalty (accessible by authenticated customer or staff/admin)
router.get('/profile/:id', customerController.getProfile);
router.get('/points/:id', customerController.getPointHistory);
router.get('/vouchers/:id', customerController.getCustomerVouchers);

// Customer self actions
router.post('/redeem-voucher', customerController.redeemVoucher);

module.exports = router;
