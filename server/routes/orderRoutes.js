const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protectUser } = require('../middleware/auth');

// Public endpoints for customers
router.post('/table-order', orderController.createTableOrder);
router.get('/track/:code', orderController.trackOrder);

// Create order (POS Staff or Admin)
router.post('/', protectUser, orderController.createOrder);

// List orders
router.get('/', protectUser, orderController.getOrders);

// Get order details
router.get('/:id', protectUser, orderController.getOrderById);

// Update status
router.patch('/:id/status', protectUser, orderController.updateOrderStatus);

// Cancel order and revert points/voucher
router.post('/:id/cancel', protectUser, orderController.cancelOrder);

module.exports = router;
