const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { protectUser, authorize } = require('../middleware/auth');

// Public / Customer list of active vouchers
router.get('/active', voucherController.getActiveVouchers);

// Admin manage vouchers
router.get('/', protectUser, authorize('ADMIN'), voucherController.getAllVouchers);
router.post('/', protectUser, authorize('ADMIN'), voucherController.createVoucher);
router.put('/:id', protectUser, authorize('ADMIN'), voucherController.updateVoucher);
router.delete('/:id', protectUser, authorize('ADMIN'), voucherController.deleteVoucher);

module.exports = router;
