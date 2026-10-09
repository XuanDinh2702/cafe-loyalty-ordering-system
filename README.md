# HỆ THỐNG ĐẶT MÓN, ĐẶT BÀN & TÍCH ĐIỂM QUÁN CÀ PHÊ (README CAFE)

Hệ thống quản lý quán cà phê toàn diện với kiến trúc Node.js/Express, MongoDB (Mongoose ODM), React và Tailwind CSS.

---

## 🌟 3 TÀI KHOẢN MẪU TẠO SẴN CHO 3 VAI TRÒ (ROLES)

Hệ thống đã tạo sẵn 3 tài khoản tương ứng với 3 vai trò. Tại cửa sổ **Đăng Nhập**, bạn có thể tự nhập thông tin hoặc click nhanh vào thẻ **Chọn nhanh tài khoản mẫu**:

| Vai Trò | Tên Đăng Nhập / SĐT | Mật Khẩu | Đặc Quyền & Tính Năng |
| :--- | :--- | :--- | :--- |
| **👑 Quản Trị Viên (Admin)** | `admin` | `admin123` | Dashboard doanh thu, lấp đầy bàn, Quản lý Menu (CRUD), Quản lý Bàn, Lịch đặt bàn, Kho voucher, Quản lý nhân sự & Nhật ký điểm |
| **💵 Nhân Viên Thu Ngân (Staff POS)** | `cashier1` | `staff123` | Màn hình POS bán hàng siêu tốc, Tra cứu khách theo SĐT để tích điểm (10.000đ = 1 điểm), Áp voucher giảm giá, Điều phối bếp, In hóa đơn nhiệt |
| **⭐ Khách Hàng Hội Viên (VIP Gold)** | `0987654321` | `123456` | Hội viên Vàng (125 điểm), Xem menu, Đặt bàn trước (chống trùng lịch), Đổi voucher giảm giá, Quản lý ví voucher & lịch sử tích điểm |

---

## 🚀 ĐƯỜNG DẪN TRUY CẬP

- **Giao diện Web (Client React):** [http://localhost:3000](http://localhost:3000)
- **API Backend (Express):** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 HỆ THỐNG ĐĂNG KÝ & ĐĂNG NHẬP MỚI
- Thanh Navbar hiển thị gọn gàng, thoáng đãng với hai nút rõ ràng: **[Đăng Ký]** và **[Đăng Nhập]**.
- **Đăng Ký:** Dành cho khách hàng mới tạo hồ sơ hội viên bằng Số điện thoại + Họ tên + Mật khẩu. Đăng ký thành công sẽ tự động đăng nhập và vào trang tích điểm.
- **Đăng Nhập:** 
  - Đăng nhập Khách hàng (SĐT + Mật khẩu).
  - Đăng nhập Thu ngân / Admin (Tên đăng nhập + Mật khẩu).
  - Có 3 nút bấm 1-click để đăng nhập nhanh 3 vai trò demo phục vụ kiểm thử tiện lợi.
