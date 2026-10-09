const Voucher = require('../models/Voucher');

// Get active vouchers for customer redemption
exports.getActiveVouchers = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      is_active: true,
      $or: [
        { start_date: null, end_date: null },
        { start_date: { $lte: now }, end_date: { $gte: now } },
        { start_date: null, end_date: { $gte: now } },
        { start_date: { $lte: now }, end_date: null }
      ]
    }).sort({ points_required: 1 });

    res.json({ success: true, count: vouchers.length, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all vouchers
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ created_at: -1 });
    res.json({ success: true, count: vouchers.length, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create voucher
exports.createVoucher = async (req, res) => {
  try {
    const {
      code,
      title,
      points_required,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_amount,
      quantity_limit,
      valid_days,
      start_date,
      end_date,
      is_active
    } = req.body;

    if (!code || !title || !discount_type || discount_value === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã, tiêu đề, loại giảm giá và giá trị giảm' });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Voucher.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Mã voucher này đã tồn tại' });
    }

    const voucher = await Voucher.create({
      code: cleanCode,
      title: title.trim(),
      points_required: Number(points_required || 0),
      discount_type,
      discount_value: Number(discount_value),
      min_order_value: Number(min_order_value || 0),
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
      quantity_limit: quantity_limit ? Number(quantity_limit) : null,
      valid_days: Number(valid_days || 30),
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ success: true, message: 'Tạo mã voucher thành công', voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update voucher
exports.updateVoucher = async (req, res) => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase().trim();
    }
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!voucher) return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
    res.json({ success: true, message: 'Cập nhật voucher thành công', voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete voucher
exports.deleteVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Xóa voucher thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
