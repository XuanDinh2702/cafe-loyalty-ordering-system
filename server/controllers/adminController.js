const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Customer = require('../models/Customer');
const Table = require('../models/Table');
const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const bcrypt = require('bcryptjs');

// Admin Dashboard KPI Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Revenue and order counts
    const [todayOrders, monthOrders, allOrders] = await Promise.all([
      Order.find({ created_at: { $gte: startOfToday }, status: { $ne: 'CANCELLED' } }),
      Order.find({ created_at: { $gte: startOfMonth }, status: { $ne: 'CANCELLED' } }),
      Order.find({ status: { $ne: 'CANCELLED' } })
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Table occupancy
    const totalTables = await Table.countDocuments();
    const occupiedTables = await Table.countDocuments({ status: 'OCCUPIED' });
    const reservedTables = await Table.countDocuments({ status: 'RESERVED' });
    const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

    // Customer tier stats
    const [bronzeCount, silverCount, goldCount, totalCustomers] = await Promise.all([
      Customer.countDocuments({ membership_tier: 'BRONZE' }),
      Customer.countDocuments({ membership_tier: 'SILVER' }),
      Customer.countDocuments({ membership_tier: 'GOLD' }),
      Customer.countDocuments()
    ]);

    // Top selling items aggregation
    const topItems = await OrderItem.aggregate([
      {
        $group: {
          _id: '$menu_item_id',
          name: { $first: '$item_name' },
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$total_price' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 6 }
    ]);

    // Points stats
    const pointStats = await PointTransaction.aggregate([
      {
        $group: {
          _id: '$type',
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    const pointsIssued = pointStats.find(p => p._id === 'EARN')?.totalPoints || 0;
    const pointsRedeemed = Math.abs(pointStats.find(p => p._id === 'REDEEM')?.totalPoints || 0);

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('customer_id', 'full_name phone')
      .populate('table_id', 'table_number')
      .sort({ created_at: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        todayRevenue,
        todayOrdersCount: todayOrders.length,
        monthRevenue,
        monthOrdersCount: monthOrders.length,
        totalRevenue,
        totalOrdersCount: allOrders.length,
        totalTables,
        occupiedTables,
        reservedTables,
        occupancyRate,
        totalCustomers,
        customerTiers: {
          bronze: bronzeCount,
          silver: silverCount,
          gold: goldCount
        },
        pointsIssued,
        pointsRedeemed,
        topItems,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Staff management
exports.getStaffList = async (req, res) => {
  try {
    const staff = await User.find().select('-password_hash').sort({ created_at: -1 });
    res.json({ success: true, count: staff.length, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { username, password, full_name, role, phone } = req.body;
    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và họ tên' });
    }

    const cleanUsername = username.toLowerCase().trim();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã được sử dụng' });
    }

    const newUser = await User.create({
      username: cleanUsername,
      password_hash: password, // pre('save') hashes this
      full_name: full_name.trim(),
      role: role || 'STAFF',
      phone: phone || '',
      status: 'ACTIVE'
    });

    const userRes = await User.findById(newUser._id).select('-password_hash');
    res.status(201).json({ success: true, message: 'Tạo tài khoản nhân viên thành công', user: userRes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    user.status = status;
    await user.save();

    res.json({ success: true, message: `Đã đổi trạng thái tài khoản thành ${status}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetStaffPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu mới' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    user.password_hash = new_password; // Trigger pre('save') hash
    await user.save();

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// All Point Transactions audit log
exports.getAuditPointTransactions = async (req, res) => {
  try {
    const { type, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      PointTransaction.find(filter)
        .populate('customer_id', 'full_name phone membership_tier')
        .populate('order_id', 'order_code total_amount')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(Number(limit)),
      PointTransaction.countDocuments(filter)
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
