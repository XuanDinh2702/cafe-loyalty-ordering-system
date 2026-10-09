const mongoose = require('mongoose');

const customerVoucherSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'USED', 'EXPIRED'],
    default: 'AVAILABLE'
  },
  redeemed_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true
  },
  used_at: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('CustomerVoucher', customerVoucherSchema);
