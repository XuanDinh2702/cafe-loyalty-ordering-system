const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  full_name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    sparse: true,
    trim: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    default: null
  },
  current_points: {
    type: Number,
    default: 0,
    min: 0
  },
  total_spent: {
    type: Number,
    default: 0,
    min: 0
  },
  membership_tier: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD'],
    default: 'BRONZE'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

customerSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password_hash) return false;
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Method to recalculate tier based on total_spent
customerSchema.methods.updateTier = function() {
  if (this.total_spent >= 5000000) {
    this.membership_tier = 'GOLD';
  } else if (this.total_spent >= 1000000) {
    this.membership_tier = 'SILVER';
  } else {
    this.membership_tier = 'BRONZE';
  }
};

module.exports = mongoose.model('Customer', customerSchema);
