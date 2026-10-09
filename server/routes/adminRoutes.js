const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protectUser, authorize } = require('../middleware/auth');

// Protect all admin routes
router.use(protectUser, authorize('ADMIN'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/staff', adminController.getStaffList);
router.post('/staff', adminController.createStaff);
router.patch('/staff/:id/status', adminController.updateStaffStatus);
router.post('/staff/:id/reset-password', adminController.resetStaffPassword);
router.get('/point-audit', adminController.getAuditPointTransactions);

module.exports = router;
