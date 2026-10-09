const TableReservation = require('../models/TableReservation');
const Table = require('../models/Table');
const Customer = require('../models/Customer');

// Get reservations with filters
exports.getReservations = async (req, res) => {
  try {
    const { date, status, table_id } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (table_id) {
      filter.table_id = table_id;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filter.start_time = { $gte: startOfDay, $lte: endOfDay };
    }

    const reservations = await TableReservation.find(filter)
      .populate('customer_id', 'full_name phone email membership_tier')
      .populate('table_id', 'table_number capacity area status')
      .sort({ start_time: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check table availability for a specific time range
exports.checkAvailability = async (req, res) => {
  try {
    const { table_id, start_time, end_time, exclude_id } = req.query;
    if (!table_id || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp bàn, giờ bắt đầu và giờ kết thúc' });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc' });
    }

    const hasConflict = await TableReservation.hasConflict(table_id, start, end, exclude_id);
    res.json({
      success: true,
      isAvailable: !hasConflict,
      message: hasConflict ? 'Bàn này đã có khách đặt trong khung giờ này' : 'Bàn trống, có thể đặt'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create reservation (Customer or Staff)
exports.createReservation = async (req, res) => {
  try {
    let { customer_id, phone, full_name, table_id, start_time, end_time, guest_count, note } = req.body;

    if (!table_id || !start_time || !end_time || !guest_count) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Giờ bắt đầu phải trước giờ kết thúc' });
    }

    // Check if table exists
    const table = await Table.findById(table_id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn yêu cầu' });
    }

    if (Number(guest_count) > table.capacity + 2) {
      return res.status(400).json({
        success: false,
        message: `Số khách (${guest_count}) vượt quá sức chứa tối đa của bàn ${table.table_number} (${table.capacity} chỗ)`
      });
    }

    // Core Business Logic: Check schedule conflict
    // Conflict if new_start < existing_end && new_end > existing_start
    const hasConflict = await TableReservation.hasConflict(table_id, start, end);
    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: `Bàn ${table.table_number} đã có lịch đặt trùng vào khoảng thời gian này. Vui lòng chọn bàn khác hoặc đổi khung giờ!`
      });
    }

    // Determine or create Customer
    if (!customer_id) {
      if (req.customer) {
        customer_id = req.customer._id;
      } else if (phone && full_name) {
        let customer = await Customer.findOne({ phone: phone.trim() });
        if (!customer) {
          customer = await Customer.create({
            phone: phone.trim(),
            full_name: full_name.trim(),
            current_points: 0,
            total_spent: 0,
            membership_tier: 'BRONZE'
          });
        }
        customer_id = customer._id;
      } else {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số điện thoại và họ tên người đặt' });
      }
    }

    const reservation = await TableReservation.create({
      customer_id,
      table_id,
      created_by: req.user ? req.user._id : null,
      start_time: start,
      end_time: end,
      guest_count: Number(guest_count),
      note: note || '',
      status: 'CONFIRMED'
    });

    const populated = await TableReservation.findById(reservation._id)
      .populate('customer_id', 'full_name phone email membership_tier')
      .populate('table_id', 'table_number capacity area');

    res.status(201).json({
      success: true,
      message: 'Đặt bàn thành công! Quán đã ghi nhận lịch hẹn của quý khách.',
      reservation: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update reservation status (CONFIRMED, COMPLETED, CANCELLED)
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await TableReservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu đặt bàn' });
    }

    reservation.status = status;
    await reservation.save();

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái phiếu đặt bàn sang ${status}`,
      reservation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
