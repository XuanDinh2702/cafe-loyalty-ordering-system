const Customer = require('../models/Customer');
const CustomerVoucher = require('../models/CustomerVoucher');
const Voucher = require('../models/Voucher');
const PointTransaction = require('../models/PointTransaction');

// Lookup customer by phone (used by POS cashier)
exports.lookupByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số điện thoại' });
    }

    const customer = await Customer.findOne({ phone: phone.trim() });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng với số điện thoại này' });
    }

    // Also fetch available customer vouchers
    const now = new Date();
    const availableVouchers = await CustomerVoucher.find({
      customer_id: customer._id,
      status: 'AVAILABLE',
      expires_at: { $gt: now }
    }).populate('voucher_id');

    res.json({
      success: true,
      customer,
      availableVouchers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Quick create customer at counter
exports.quickCreateCustomer = async (req, res) => {
  try {
    const { phone, full_name, email } = req.body;
    if (!phone || !full_name) {
      return res.status(400).json({ success: false, message: 'Số điện thoại và họ tên là bắt buộc' });
    }

    const cleanPhone = phone.trim();
    const existing = await Customer.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã tồn tại trong hệ thống' });
    }

    const newCustomer = await Customer.create({
      phone: cleanPhone,
      full_name: full_name.trim(),
      email: email ? email.trim() : undefined,
      current_points: 0,
      total_spent: 0,
      membership_tier: 'BRONZE',
      status: 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      message: 'Tạo hồ sơ khách hàng mới thành công',
      customer: newCustomer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Customer Profile (points, tier, spend)
exports.getProfile = async (req, res) => {
  try {
    const customerId = req.params.id || req.customer?._id;
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã định danh khách hàng' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }

    // Tier progress calculation
    let nextTier = null;
    let spendNeeded = 0;
    let progressPercentage = 100;

    if (customer.membership_tier === 'BRONZE') {
      nextTier = 'SILVER';
      spendNeeded = Math.max(0, 1000000 - customer.total_spent);
      progressPercentage = Math.min(100, Math.round((customer.total_spent / 1000000) * 100));
    } else if (customer.membership_tier === 'SILVER') {
      nextTier = 'GOLD';
      spendNeeded = Math.max(0, 5000000 - customer.total_spent);
      progressPercentage = Math.min(100, Math.round(((customer.total_spent - 1000000) / 4000000) * 100));
    }

    res.json({
      success: true,
      customer,
      tierInfo: {
        currentTier: customer.membership_tier,
        nextTier,
        spendNeeded,
        progressPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Point History
exports.getPointHistory = async (req, res) => {
  try {
    const customerId = req.params.id || req.customer?._id;
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã định danh khách hàng' });
    }

    const transactions = await PointTransaction.find({ customer_id: customerId })
      .populate('order_id', 'order_code total_amount created_at')
      .populate({
        path: 'customer_voucher_id',
        populate: { path: 'voucher_id', select: 'code title discount_value discount_type' }
      })
      .sort({ created_at: -1 });

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Customer's Vouchers
exports.getCustomerVouchers = async (req, res) => {
  try {
    const customerId = req.params.id || req.customer?._id;
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã định danh khách hàng' });
    }

    const vouchers = await CustomerVoucher.find({ customer_id: customerId })
      .populate('voucher_id')
      .sort({ redeemed_at: -1 });

    res.json({
      success: true,
      vouchers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Redeem points for voucher
exports.redeemVoucher = async (req, res) => {
  try {
    const customerId = req.customer?._id || req.body.customer_id;
    const { voucher_id } = req.body;

    if (!customerId || !voucher_id) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin khách hàng hoặc mã ưu đãi' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }

    const voucher = await Voucher.findById(voucher_id);
    if (!voucher || !voucher.is_active) {
      return res.status(400).json({ success: false, message: 'Chương trình ưu đãi không tồn tại hoặc đã tạm dừng' });
    }

    const now = new Date();
    if (voucher.start_date && now < voucher.start_date) {
      return res.status(400).json({ success: false, message: 'Chương trình ưu đãi chưa bắt đầu' });
    }
    if (voucher.end_date && now > voucher.end_date) {
      return res.status(400).json({ success: false, message: 'Chương trình ưu đãi đã kết thúc' });
    }

    if (customer.current_points < voucher.points_required) {
      return res.status(400).json({
        success: false,
        message: `Bạn không đủ điểm! Cần ${voucher.points_required} điểm (Hiện có: ${customer.current_points} điểm)`
      });
    }

    // Deduct points
    customer.current_points -= voucher.points_required;
    await customer.save();

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (voucher.valid_days || 30));

    // Create CustomerVoucher
    const customerVoucher = await CustomerVoucher.create({
      customer_id: customer._id,
      voucher_id: voucher._id,
      status: 'AVAILABLE',
      redeemed_at: new Date(),
      expires_at: voucher.end_date && voucher.end_date < expiresAt ? voucher.end_date : expiresAt
    });

    // Record PointTransaction
    await PointTransaction.create({
      customer_id: customer._id,
      customer_voucher_id: customerVoucher._id,
      type: 'REDEEM',
      points: -voucher.points_required,
      balance_after: customer.current_points,
      description: `Đổi mã ưu đãi "${voucher.title}" (-${voucher.points_required} điểm)`
    });

    res.status(201).json({
      success: true,
      message: `Đổi mã ưu đãi "${voucher.title}" thành công!`,
      customerVoucher,
      current_points: customer.current_points
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
