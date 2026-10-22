const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Customer = require('../models/Customer');
const CustomerVoucher = require('../models/CustomerVoucher');
const Table = require('../models/Table');
const PointTransaction = require('../models/PointTransaction');
const MenuItem = require('../models/MenuItem');

// Helper to generate unique order code
const generateOrderCode = async () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const code = `CF-${dateStr}-${randomSuffix}`;
  const exists = await Order.findOne({ order_code: code });
  if (exists) return generateOrderCode();
  return code;
};

// Create a new order (POS Checkout)
exports.createOrder = async (req, res) => {
  try {
    const {
      customer_id,
      table_id,
      order_type = 'DINE_IN',
      items,
      customer_voucher_id,
      payment_method = 'CASH',
      reservation_id
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Đơn hàng phải có ít nhất 1 món' });
    }

    // 1. Calculate Subtotal and validate items
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menu_item_id);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Không tìm thấy món ID: ${item.menu_item_id}` });
      }

      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(menuItem.price);
      const itemTotal = qty * unitPrice;
      subtotal += itemTotal;

      validatedItems.push({
        menu_item_id: menuItem._id,
        item_name: menuItem.name,
        quantity: qty,
        unit_price: unitPrice,
        total_price: itemTotal,
        note: item.note || ''
      });
    }

    // 2. Voucher validation and discount calculation
    let discountAmount = 0;
    let appliedCustomerVoucher = null;

    if (customer_voucher_id) {
      appliedCustomerVoucher = await CustomerVoucher.findById(customer_voucher_id).populate('voucher_id');
      if (!appliedCustomerVoucher) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin voucher của khách hàng' });
      }

      if (appliedCustomerVoucher.status !== 'AVAILABLE') {
        return res.status(400).json({ success: false, message: 'Mã voucher này đã được sử dụng hoặc không hợp lệ' });
      }

      const now = new Date();
      if (appliedCustomerVoucher.expires_at < now) {
        appliedCustomerVoucher.status = 'EXPIRED';
        await appliedCustomerVoucher.save();
        return res.status(400).json({ success: false, message: 'Mã voucher này đã hết hạn sử dụng' });
      }

      const voucher = appliedCustomerVoucher.voucher_id;
      if (voucher.min_order_value && subtotal < voucher.min_order_value) {
        return res.status(400).json({
          success: false,
          message: `Voucher yêu cầu đơn hàng tối thiểu ${voucher.min_order_value.toLocaleString('vi-VN')} VNĐ`
        });
      }

      if (voucher.discount_type === 'PERCENTAGE') {
        let calculated = (subtotal * voucher.discount_value) / 100;
        if (voucher.max_discount_amount && calculated > voucher.max_discount_amount) {
          calculated = voucher.max_discount_amount;
        }
        discountAmount = Math.round(calculated);
      } else {
        discountAmount = Math.min(subtotal, voucher.discount_value);
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    // 3. Loyalty Points Calculation
    // Rule: Every 10,000 VND paid (after discount) gives 1 point
    const pointsEarned = customer_id ? Math.floor(totalAmount / 10000) : 0;

    const orderCode = await generateOrderCode();

    // 4. Create Order document
    const order = await Order.create({
      customer_id: customer_id || null,
      staff_id: req.user ? req.user._id : null,
      table_id: table_id || null,
      customer_voucher_id: customer_voucher_id || null,
      reservation_id: reservation_id || null,
      order_code: orderCode,
      order_type,
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      points_earned: pointsEarned,
      payment_method,
      payment_status: 'PAID',
      paid_at: new Date(),
      status: 'COMPLETED'
    });

    // 5. Create OrderItem documents
    const createdItems = await Promise.all(
      validatedItems.map(item =>
        OrderItem.create({
          ...item,
          order_id: order._id
        })
      )
    );

    // 6. Handle Voucher State Update
    if (appliedCustomerVoucher) {
      appliedCustomerVoucher.status = 'USED';
      appliedCustomerVoucher.used_at = new Date();
      await appliedCustomerVoucher.save();
    }

    // 7. Update Customer Points & Tier
    let updatedCustomer = null;
    if (customer_id) {
      const customer = await Customer.findById(customer_id);
      if (customer) {
        customer.current_points += pointsEarned;
        customer.total_spent += totalAmount;
        customer.updateTier();
        await customer.save();
        updatedCustomer = customer;

        // Log PointTransaction (EARN)
        await PointTransaction.create({
          customer_id: customer._id,
          order_id: order._id,
          type: 'EARN',
          points: pointsEarned,
          balance_after: customer.current_points,
          description: `Tích điểm đơn hàng #${orderCode} (+${pointsEarned} điểm)`
        });
      }
    }

    // 8. Update Table status if Dine In
    if (table_id && order_type === 'DINE_IN') {
      await Table.findByIdAndUpdate(table_id, { status: 'OCCUPIED' });
    }

    // Fetch full order with populated fields for response & receipt
    const populatedOrder = await Order.findById(order._id)
      .populate('customer_id', 'full_name phone email membership_tier current_points')
      .populate('staff_id', 'full_name username')
      .populate('table_id', 'table_number area')
      .populate({
        path: 'customer_voucher_id',
        populate: { path: 'voucher_id', select: 'code title discount_type discount_value' }
      });

    res.status(201).json({
      success: true,
      message: 'Thanh toán và tạo đơn hàng thành công!',
      order: populatedOrder,
      items: createdItems,
      customer: updatedCustomer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get list of orders
exports.getOrders = async (req, res) => {
  try {
    const { status, order_type, date, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (order_type && order_type !== 'all') {
      filter.order_type = order_type;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.created_at = { $gte: startOfDay, $lte: endOfDay };
    }
    if (search) {
      filter.order_code = { $regex: search.trim(), $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer_id', 'full_name phone membership_tier')
        .populate('staff_id', 'full_name')
        .populate('table_id', 'table_number area')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    const orderIds = orders.map(o => o._id);
    const orderItems = await OrderItem.find({ order_id: { $in: orderIds } });
    const ordersWithItems = orders.map(o => {
      const oObj = o.toObject();
      oObj.items = orderItems.filter(item => String(item.order_id) === String(o._id));
      return oObj;
    });

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      orders: ordersWithItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order with details
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer_id', 'full_name phone email membership_tier current_points')
      .populate('staff_id', 'full_name username')
      .populate('table_id', 'table_number area')
      .populate({
        path: 'customer_voucher_id',
        populate: { path: 'voucher_id' }
      });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const items = await OrderItem.find({ order_id: order._id });

    res.json({
      success: true,
      order,
      items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (PENDING, PREPARING, READY, COMPLETED, CANCELLED)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    order.status = status;
    await order.save();

    // If completed or cancelled, handle table status if dine-in
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      if (order.table_id) {
        // Free the table
        await Table.findByIdAndUpdate(order.table_id, { status: 'AVAILABLE' });
      }
    }

    res.json({ success: true, message: `Đã cập nhật trạng thái đơn thành ${status}`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Order & Revert points/voucher
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (order.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Đơn hàng này đã bị hủy trước đó' });
    }

    // 1. Revert points earned
    if (order.customer_id && order.points_earned > 0) {
      const customer = await Customer.findById(order.customer_id);
      if (customer) {
        customer.current_points = Math.max(0, customer.current_points - order.points_earned);
        customer.total_spent = Math.max(0, customer.total_spent - order.total_amount);
        customer.updateTier();
        await customer.save();

        await PointTransaction.create({
          customer_id: customer._id,
          order_id: order._id,
          type: 'ADJUST',
          points: -order.points_earned,
          balance_after: customer.current_points,
          description: `Thu hồi điểm do hủy đơn hàng #${order.order_code}`
        });
      }
    }

    // 2. Revert voucher used
    if (order.customer_voucher_id) {
      await CustomerVoucher.findByIdAndUpdate(order.customer_voucher_id, {
        status: 'AVAILABLE',
        used_at: null
      });
    }

    // 3. Free table
    if (order.table_id) {
      await Table.findByIdAndUpdate(order.table_id, { status: 'AVAILABLE' });
    }

    order.status = 'CANCELLED';
    order.payment_status = 'REFUNDED';
    await order.save();

    res.json({
      success: true,
      message: `Đã hủy đơn hàng #${order.order_code} và hoàn trả điểm thưởng/voucher thành công`,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a table self-order directly from web (Customer / QR at table)
exports.createTableOrder = async (req, res) => {
  try {
    const {
      table_number,
      table_id,
      customer_id,
      customer_phone,
      items,
      customer_voucher_id,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Đơn hàng phải có ít nhất 1 món' });
    }

    // 1. Resolve Table
    let resolvedTable = null;
    if (table_id) {
      resolvedTable = await Table.findById(table_id);
    } else if (table_number) {
      resolvedTable = await Table.findOne({ table_number: String(table_number).trim().toUpperCase() });
      if (!resolvedTable) {
        resolvedTable = await Table.findOne({ table_number: String(table_number).trim() });
      }
    }

    if (!resolvedTable) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn số bàn hợp lệ trước khi đặt món' });
    }

    // 2. Resolve Customer (by id or phone for loyalty points)
    let resolvedCustomer = null;
    if (customer_id) {
      resolvedCustomer = await Customer.findById(customer_id);
    } else if (customer_phone) {
      resolvedCustomer = await Customer.findOne({ phone: String(customer_phone).trim() });
    }

    // 3. Validate items & calculate Subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menu_item_id);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Không tìm thấy món ID: ${item.menu_item_id}` });
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Number(menuItem.price);
      const itemTotal = qty * unitPrice;
      subtotal += itemTotal;

      validatedItems.push({
        menu_item_id: menuItem._id,
        item_name: menuItem.name,
        quantity: qty,
        unit_price: unitPrice,
        total_price: itemTotal,
        note: item.note || ''
      });
    }

    // 4. Voucher discount calculation
    let discountAmount = 0;
    let appliedCustomerVoucher = null;

    if (customer_voucher_id && resolvedCustomer) {
      appliedCustomerVoucher = await CustomerVoucher.findOne({
        _id: customer_voucher_id,
        customer_id: resolvedCustomer._id
      }).populate('voucher_id');

      if (appliedCustomerVoucher && appliedCustomerVoucher.status === 'AVAILABLE') {
        const voucher = appliedCustomerVoucher.voucher_id;
        const now = new Date();
        if (appliedCustomerVoucher.expires_at >= now) {
          if (!voucher.min_order_value || subtotal >= voucher.min_order_value) {
            if (voucher.discount_type === 'PERCENTAGE') {
              let calculated = (subtotal * voucher.discount_value) / 100;
              if (voucher.max_discount_amount && calculated > voucher.max_discount_amount) {
                calculated = voucher.max_discount_amount;
              }
              discountAmount = Math.round(calculated);
            } else {
              discountAmount = Math.min(subtotal, voucher.discount_value);
            }
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    // Loyalty Rule: 10,000 VND = 1 point
    const pointsEarned = resolvedCustomer ? Math.floor(totalAmount / 10000) : 0;
    const orderCode = await generateOrderCode();

    // 5. Create Order with status PREPARING for kitchen/barista
    const order = await Order.create({
      customer_id: resolvedCustomer ? resolvedCustomer._id : null,
      staff_id: null,
      table_id: resolvedTable._id,
      customer_voucher_id: appliedCustomerVoucher ? appliedCustomerVoucher._id : null,
      order_code: orderCode,
      order_type: 'DINE_IN',
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      points_earned: pointsEarned,
      payment_method: 'CASH',
      payment_status: 'PENDING',
      status: 'PREPARING',
      notes: notes || ''
    });

    // 6. Create OrderItems
    const createdItems = await Promise.all(
      validatedItems.map(item =>
        OrderItem.create({
          ...item,
          order_id: order._id
        })
      )
    );

    // 7. Update voucher if applied
    if (appliedCustomerVoucher) {
      appliedCustomerVoucher.status = 'USED';
      appliedCustomerVoucher.used_at = new Date();
      await appliedCustomerVoucher.save();
    }

    // 8. Update customer loyalty points
    if (resolvedCustomer && pointsEarned > 0) {
      resolvedCustomer.current_points += pointsEarned;
      resolvedCustomer.total_spent += totalAmount;
      resolvedCustomer.updateTier();
      await resolvedCustomer.save();

      await PointTransaction.create({
        customer_id: resolvedCustomer._id,
        order_id: order._id,
        type: 'EARN',
        points: pointsEarned,
        balance_after: resolvedCustomer.current_points,
        description: `Tích điểm gọi món tại bàn #${orderCode} (+${pointsEarned} điểm)`
      });
    }

    // 9. Update table status to OCCUPIED
    resolvedTable.status = 'OCCUPIED';
    await resolvedTable.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer_id', 'full_name phone membership_tier current_points')
      .populate('table_id', 'table_number area');

    res.status(201).json({
      success: true,
      message: `Đã gửi đơn gọi món Bàn ${resolvedTable.table_number} vào quầy Barista thành công!`,
      order: populatedOrder,
      items: createdItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customer order tracking by order code (public)
exports.trackOrder = async (req, res) => {
  try {
    const { code } = req.params;
    const order = await Order.findOne({ order_code: code.trim().toUpperCase() })
      .populate('customer_id', 'full_name phone')
      .populate('table_id', 'table_number area');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const items = await OrderItem.find({ order_id: order._id });

    res.json({
      success: true,
      order,
      items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
