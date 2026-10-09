const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { protectUser, authorize } = require('../middleware/auth');

// Public read tables (for reservation screen & floor plan)
router.get('/', tableController.getTables);

// Admin & Staff update table status
router.patch('/:id/status', protectUser, tableController.updateStatus);

// Admin manage tables
router.post('/', protectUser, authorize('ADMIN'), tableController.createTable);
router.put('/:id', protectUser, authorize('ADMIN'), tableController.updateTable);
router.delete('/:id', protectUser, authorize('ADMIN'), tableController.deleteTable);

module.exports = router;
