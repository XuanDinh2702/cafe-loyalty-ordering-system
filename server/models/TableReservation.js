const mongoose = require('mongoose');

const tableReservationSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  table_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },
  guest_count: {
    type: Number,
    required: true,
    min: 1
  },
  note: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Check overlapping helper logic can also be placed here or in controller
tableReservationSchema.statics.hasConflict = async function(tableId, startTime, endTime, excludeReservationId = null) {
  const query = {
    table_id: tableId,
    status: { $in: ['PENDING', 'CONFIRMED'] },
    // Conflict rule: new_start < existing_end AND new_end > existing_start
    start_time: { $lt: endTime },
    end_time: { $gt: startTime }
  };

  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const conflict = await this.findOne(query);
  return !!conflict;
};

module.exports = mongoose.model('TableReservation', tableReservationSchema);
