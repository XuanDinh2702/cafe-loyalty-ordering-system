const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protectUser, authorize } = require('../middleware/auth');

// Public read
router.get('/categories', menuController.getCategories);
router.get('/items', menuController.getMenuItems);

// Admin manage categories
router.post('/categories', protectUser, authorize('ADMIN'), menuController.createCategory);
router.put('/categories/:id', protectUser, authorize('ADMIN'), menuController.updateCategory);
router.delete('/categories/:id', protectUser, authorize('ADMIN'), menuController.deleteCategory);

// Admin manage menu items
router.post('/items', protectUser, authorize('ADMIN'), menuController.createMenuItem);
router.put('/items/:id', protectUser, authorize('ADMIN'), menuController.updateMenuItem);
router.delete('/items/:id', protectUser, authorize('ADMIN'), menuController.deleteMenuItem);

module.exports = router;
