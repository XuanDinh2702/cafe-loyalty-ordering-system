const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  table_number: {
    type: String,
    required: [true, 'Table number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  area: {
    type: String,
    enum: ['INDOOR', 'OUTDOOR', 'ROOFTOP'],
    default: 'INDOOR',
    required: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'],
    default: 'AVAILABLE'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Table', tableSchema);
