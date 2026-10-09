const User = require('../models/User');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Staff / Admin Login
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị vô hiệu hóa' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    const token = generateToken(user._id, user.role);
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customer Register
exports.customerRegister = async (req, res) => {
  try {
    const { phone, full_name, email, password } = req.body;
    if (!phone || !full_name) {
      return res.status(400).json({ success: false, message: 'Số điện thoại và họ tên là bắt buộc' });
    }

    const existingCustomer = await Customer.findOne({ phone: phone.trim() });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được đăng ký' });
    }

    let password_hash = null;
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }

    const customer = await Customer.create({
      phone: phone.trim(),
      full_name: full_name.trim(),
      email: email ? email.trim() : undefined,
      password_hash,
      current_points: 0,
      total_spent: 0,
      membership_tier: 'BRONZE',
      status: 'ACTIVE'
    });

    const token = generateToken(customer._id, 'CUSTOMER');
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành viên thành công',
      token,
      customer: {
        id: customer._id,
        phone: customer.phone,
        full_name: customer.full_name,
        email: customer.email,
        current_points: customer.current_points,
        total_spent: customer.total_spent,
        membership_tier: customer.membership_tier
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customer Login
exports.customerLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập số điện thoại' });
    }

    const customer = await Customer.findOne({ phone: phone.trim() });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Số điện thoại chưa được đăng ký trong hệ thống' });
    }

    if (customer.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Tài khoản hội viên đã bị khóa' });
    }

    if (password) {
      const isMatch = await customer.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác' });
      }
    }

    const token = generateToken(customer._id, 'CUSTOMER');
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      customer: {
        id: customer._id,
        phone: customer.phone,
        full_name: customer.full_name,
        email: customer.email,
        current_points: customer.current_points,
        total_spent: customer.total_spent,
        membership_tier: customer.membership_tier
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Current User / Customer
exports.getMe = async (req, res) => {
  try {
    if (req.user) {
      res.json({ success: true, user: req.user, role: req.user.role });
    } else if (req.customer) {
      res.json({ success: true, customer: req.customer, role: 'CUSTOMER' });
    } else {
      res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
