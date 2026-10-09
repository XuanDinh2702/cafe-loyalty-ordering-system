const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  table_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    default: null
  },
  customer_voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerVoucher',
    default: null
  },
  reservation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TableReservation',
    default: null
  },
  order_code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  order_type: {
    type: String,
    enum: ['DINE_IN', 'TAKEAWAY'],
    default: 'DINE_IN'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  points_earned: {
    type: Number,
    default: 0,
    min: 0
  },
  payment_method: {
    type: String,
    enum: ['CASH', 'TRANSFER', 'CARD'],
    default: 'CASH'
  },
  payment_status: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED'],
    default: 'PAID'
  },
  paid_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
    default: 'COMPLETED'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Order', orderSchema);
