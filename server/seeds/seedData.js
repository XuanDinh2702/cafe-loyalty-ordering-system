const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Table = require('../models/Table');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Voucher = require('../models/Voucher');
const CustomerVoucher = require('../models/CustomerVoucher');
const TableReservation = require('../models/TableReservation');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const PointTransaction = require('../models/PointTransaction');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe_loyalty_db');
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Customer.deleteMany(),
      Table.deleteMany(),
      Category.deleteMany(),
      MenuItem.deleteMany(),
      Voucher.deleteMany(),
      CustomerVoucher.deleteMany(),
      TableReservation.deleteMany(),
      Order.deleteMany(),
      OrderItem.deleteMany(),
      PointTransaction.deleteMany()
    ]);
    console.log('Cleared existing collections.');

    // 1. Users (Admin and Staff)
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const staffPass = await bcrypt.hash('staff123', salt);

    const [adminUser, staffUser] = await User.create([
      {
        username: 'admin',
        password_hash: adminPass,
        full_name: 'Nguyễn Quản Trị (Admin)',
        role: 'ADMIN',
        phone: '0909000001',
        status: 'ACTIVE'
      },
      {
        username: 'cashier1',
        password_hash: staffPass,
        full_name: 'Trần Thu Ngân (Staff)',
        role: 'STAFF',
        phone: '0909000002',
        status: 'ACTIVE'
      }
    ]);
    console.log('Created Users.');

    // 2. Customers
    const custPass = await bcrypt.hash('123456', salt);
    const customers = await Customer.create([
      {
        phone: '0987654321',
        full_name: 'Nguyễn Văn Hoàng (Gold VIP)',
        email: 'hoang.nguyen@gmail.com',
        password_hash: custPass,
        current_points: 125,
        total_spent: 5850000,
        membership_tier: 'GOLD',
        status: 'ACTIVE'
      },
      {
        phone: '0912345678',
        full_name: 'Lê Thị Mai (Silver)',
        email: 'mai.le@gmail.com',
        password_hash: custPass,
        current_points: 48,
        total_spent: 2450000,
        membership_tier: 'SILVER',
        status: 'ACTIVE'
      },
      {
        phone: '0901122334',
        full_name: 'Phạm Minh Tuấn (Bronze)',
        email: 'tuan.pham@gmail.com',
        password_hash: custPass,
        current_points: 15,
        total_spent: 350000,
        membership_tier: 'BRONZE',
        status: 'ACTIVE'
      }
    ]);
    console.log('Created Customers.');

    // 3. Tables
    const tables = await Table.create([
      { table_number: 'T01', capacity: 2, area: 'INDOOR', status: 'AVAILABLE' },
      { table_number: 'T02', capacity: 4, area: 'INDOOR', status: 'AVAILABLE' },
      { table_number: 'T03', capacity: 4, area: 'INDOOR', status: 'OCCUPIED' },
      { table_number: 'T04', capacity: 6, area: 'INDOOR', status: 'AVAILABLE' },
      { table_number: 'T05', capacity: 4, area: 'OUTDOOR', status: 'AVAILABLE' },
      { table_number: 'T06', capacity: 2, area: 'OUTDOOR', status: 'RESERVED' },
      { table_number: 'T07', capacity: 6, area: 'OUTDOOR', status: 'AVAILABLE' },
      { table_number: 'T08', capacity: 4, area: 'ROOFTOP', status: 'AVAILABLE' },
      { table_number: 'T09', capacity: 4, area: 'ROOFTOP', status: 'AVAILABLE' },
      { table_number: 'T10', capacity: 8, area: 'ROOFTOP', status: 'AVAILABLE' }
    ]);
    console.log('Created Tables.');

    // 4. Categories
    const categories = await Category.create([
      {
        name: 'Cà Phê Truyền Thống & Espresso',
        slug: 'ca-phe',
        description: 'Các món cà phê pha phin truyền thống và máy espresso thượng hạng',
        sort_order: 1,
        is_active: true
      },
      {
        name: 'Trà Trái Cây & Trà Sữa',
        slug: 'tra-trai-cay',
        description: 'Trà ủ lạnh, trái cây tươi nhiệt đới và trà sữa đậm đà',
        sort_order: 2,
        is_active: true
      },
      {
        name: 'Bánh Ngọt & Tráng Miệng',
        slug: 'banh-ngot',
        description: 'Bánh nướng hàng ngày phong cách Pháp và tráng miệng thanh mát',
        sort_order: 3,
        is_active: true
      },
      {
        name: 'Đá Xay & Sinh Tố Fresh',
        slug: 'da-xay',
        description: 'Thức uống xay tuyết mát lạnh cùng trái cây nguyên chất',
        sort_order: 4,
        is_active: true
      }
    ]);
    console.log('Created Categories.');

    // 5. Menu Items
    const menuItems = await MenuItem.create([
      // Ca phe
      {
        category_id: categories[0]._id,
        name: 'Cà Phê Muối Đặc Sản',
        price: 35000,
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        description: 'Cà phê Robusta Đắk Lắk kết hợp lớp kem muối béo mặn thơm ngậy chuẩn vị Huế',
        is_available: true
      },
      {
        category_id: categories[0]._id,
        name: 'Cà Phê Sữa Đá Sài Gòn',
        price: 29000,
        image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
        description: 'Cà phê pha phin truyền thống hòa quyện cùng sữa đặc béo ngậy ngọt ngào',
        is_available: true
      },
      {
        category_id: categories[0]._id,
        name: 'Bạc Xỉu Kem Trứng Cháy',
        price: 39000,
        image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80',
        description: 'Bạc xỉu ba tầng hấp dẫn phủ lớp kem trứng tươi khò lửa thơm lừng',
        is_available: true
      },
      {
        category_id: categories[0]._id,
        name: 'Caramel Macchiato Đá',
        price: 49000,
        image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80',
        description: 'Espresso kép, sữa tươi thanh trùng và sốt caramel hảo hạng nhập khẩu',
        is_available: true
      },
      // Tra
      {
        category_id: categories[1]._id,
        name: 'Trà Đào Cam Sả Tươi',
        price: 45000,
        image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
        description: 'Trà đen thanh mát kết hợp lát đào vàng giòn sần sật, cam vàng và sả đập dập',
        is_available: true
      },
      {
        category_id: categories[1]._id,
        name: 'Trà Mãng Cầu Nhiệt Đới',
        price: 42000,
        image_url: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600&auto=format&fit=crop&q=80',
        description: 'Thịt mãng cầu tươi chua ngọt đậm vị trên nền trà lài thơm nức lòng',
        is_available: true
      },
      {
        category_id: categories[1]._id,
        name: 'Trà Sữa Oolong Nướng Trân Châu',
        price: 45000,
        image_url: 'https://images.unsplash.com/photo-1558857563-b37cfbbfb46c?w=600&auto=format&fit=crop&q=80',
        description: 'Trà Oolong nướng than đượm hương khói hòa quyện sữa kem béo và trân châu đen',
        is_available: true
      },
      // Banh
      {
        category_id: categories[2]._id,
        name: 'Bánh Tiramisu Ý Cacao',
        price: 45000,
        image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
        description: 'Bánh Tiramisu cổ điển ngâm cà phê và rượu rum, phô mai Mascarpone mềm mịn',
        is_available: true
      },
      {
        category_id: categories[2]._id,
        name: 'Croissant Bơ Pháp Nướng',
        price: 35000,
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
        description: 'Bánh sừng bò bơ Pháp ngàn lớp vỏ ngoài giòn rụm ruột xốp thơm bơ',
        is_available: true
      },
      {
        category_id: categories[2]._id,
        name: 'Bánh Basque Burnt Cheesecake',
        price: 52000,
        image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
        description: 'Phô mai nướng cháy cạnh kiểu Tây Ban Nha, mềm tan chảy trong miệng',
        is_available: true
      },
      // Da xay
      {
        category_id: categories[3]._id,
        name: 'Matcha Uji Đá Xay Hạnh Nhân',
        price: 55000,
        image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
        description: 'Bột trà xanh Nhật Bản Uji xay cùng sữa tươi, phủ bông kem whipping và hạnh nhân lát',
        is_available: true
      },
      {
        category_id: categories[3]._id,
        name: 'Sinh Tố Bơ Sáp Dừa Tươi',
        price: 48000,
        image_url: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80',
        description: 'Bơ sáp Đắk Lắk dẻo quánh xay cùng nước cốt dừa Bến Tre thơm lừng',
        is_available: true
      }
    ]);
    console.log('Created Menu Items.');

    // 6. Vouchers
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 2);

    const vouchers = await Voucher.create([
      {
        code: 'CHAOBAN15',
        title: 'Giảm 15.000 VNĐ mừng khách mới',
        points_required: 10,
        discount_type: 'FIXED',
        discount_value: 15000,
        min_order_value: 50000,
        valid_days: 30,
        start_date: now,
        end_date: nextMonth,
        is_active: true
      },
      {
        code: 'COFFEE20PCT',
        title: 'Giảm 20% tổng hóa đơn (Tối đa 30k)',
        points_required: 25,
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        min_order_value: 60000,
        max_discount_amount: 30000,
        valid_days: 30,
        start_date: now,
        end_date: nextMonth,
        is_active: true
      },
      {
        code: 'VIPGOLD50K',
        title: 'Ưu đãi VIP Giảm 50.000 VNĐ',
        points_required: 50,
        discount_type: 'FIXED',
        discount_value: 50000,
        min_order_value: 100000,
        valid_days: 45,
        start_date: now,
        end_date: nextMonth,
        is_active: true
      },
      {
        code: 'SWEETCAKE35',
        title: 'Tặng 35.000 VNĐ khi gọi Bánh & Tráng miệng',
        points_required: 30,
        discount_type: 'FIXED',
        discount_value: 35000,
        min_order_value: 80000,
        valid_days: 30,
        start_date: now,
        end_date: nextMonth,
        is_active: true
      }
    ]);
    console.log('Created Vouchers.');

    // 7. Customer Vouchers for the Gold customer
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 20);

    const custVoucher = await CustomerVoucher.create({
      customer_id: customers[0]._id,
      voucher_id: vouchers[1]._id, // 20% off
      status: 'AVAILABLE',
      redeemed_at: new Date(),
      expires_at: expiryDate
    });
    console.log('Created Customer Vouchers.');

    // 8. Sample Table Reservation
    const resStart = new Date();
    resStart.setHours(resStart.getHours() + 2, 0, 0, 0);
    const resEnd = new Date(resStart);
    resEnd.setHours(resEnd.getHours() + 2);

    await TableReservation.create({
      customer_id: customers[0]._id,
      table_id: tables[5]._id, // T06
      created_by: adminUser._id,
      start_time: resStart,
      end_time: resEnd,
      guest_count: 2,
      note: 'Bàn ngoài trời gần cây xanh ngắm phố',
      status: 'CONFIRMED'
    });
    console.log('Created Sample Reservation.');

    // 9. Sample Past Order & Point Transactions
    const orderCode = 'CF-2610-1001';
    const subtotal = 114000;
    const discount = 20000;
    const totalAmount = 94000;
    const pointsEarned = 9; // 94,000 / 10,000 = 9

    const sampleOrder = await Order.create({
      customer_id: customers[0]._id,
      staff_id: staffUser._id,
      table_id: tables[2]._id,
      order_code: orderCode,
      order_type: 'DINE_IN',
      subtotal,
      discount_amount: discount,
      total_amount: totalAmount,
      points_earned: pointsEarned,
      payment_method: 'TRANSFER',
      payment_status: 'PAID',
      paid_at: new Date(),
      status: 'COMPLETED'
    });

    await OrderItem.create([
      {
        order_id: sampleOrder._id,
        menu_item_id: menuItems[0]._id,
        item_name: menuItems[0].name,
        quantity: 2,
        unit_price: 35000,
        total_price: 70000,
        note: 'Ít đường nhiều đá'
      },
      {
        order_id: sampleOrder._id,
        menu_item_id: menuItems[6]._id,
        item_name: menuItems[6].name,
        quantity: 1,
        unit_price: 44000,
        total_price: 44000,
        note: 'Trân châu riêng'
      }
    ]);

    await PointTransaction.create({
      customer_id: customers[0]._id,
      order_id: sampleOrder._id,
      type: 'EARN',
      points: pointsEarned,
      balance_after: customers[0].current_points,
      description: `Tích điểm đơn hàng #${orderCode} (+${pointsEarned} điểm)`
    });

    console.log('==================================================');
    console.log('Database Seeded Successfully!');
    console.log('--------------------------------------------------');
    console.log('Admin Account:   username = admin      | password = admin123');
    console.log('Staff Account:   username = cashier1   | password = staff123');
    console.log('Gold Customer:   phone = 0987654321    | password = 123456');
    console.log('Silver Customer: phone = 0912345678    | password = 123456');
    console.log('Bronze Customer: phone = 0901122334    | password = 123456');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
