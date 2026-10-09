const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protectUser, protectCustomer } = require('../middleware/auth');

router.post('/login', authController.loginUser);
router.post('/customer/register', authController.customerRegister);
router.post('/customer/login', authController.customerLogin);

// Get me endpoint supports either user or customer
router.get('/me', (req, res, next) => {
  protectUser(req, res, (err) => {
    if (!err && req.user) return authController.getMe(req, res);
    protectCustomer(req, res, () => authController.getMe(req, res));
  });
});

module.exports = router;
