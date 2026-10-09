const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  customer_voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerVoucher',
    default: null
  },
  type: {
    type: String,
    enum: ['EARN', 'REDEEM', 'ADJUST'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  balance_after: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);
