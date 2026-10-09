const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Voucher code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  points_required: {
    type: Number,
    required: [true, 'Points required is required'],
    min: 0,
    default: 0
  },
  discount_type: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED'],
    required: true
  },
  discount_value: {
    type: Number,
    required: true,
    min: 0
  },
  min_order_value: {
    type: Number,
    default: 0,
    min: 0
  },
  max_discount_amount: {
    type: Number,
    default: null
  },
  quantity_limit: {
    type: Number,
    default: null
  },
  valid_days: {
    type: Number,
    default: 30
  },
  start_date: {
    type: Date,
    default: null
  },
  end_date: {
    type: Date,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Voucher', voucherSchema);
