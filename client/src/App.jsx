import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Customer Pages
import MenuPage from './pages/customer/MenuPage';
import BookingPage from './pages/customer/BookingPage';
import LoyaltyPage from './pages/customer/LoyaltyPage';

// Staff POS Pages
import POSPage from './pages/pos/POSPage';
import ActiveOrdersPage from './pages/pos/ActiveOrdersPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagePage from './pages/admin/MenuManagePage';
import TableManagePage from './pages/admin/TableManagePage';
import VoucherManagePage from './pages/admin/VoucherManagePage';
import StaffManagePage from './pages/admin/StaffManagePage';
import ReservationsPage from './pages/admin/ReservationsPage';
import PointAuditPage from './pages/admin/PointAuditPage';

import { Coffee, ShieldAlert, Heart } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('menu');
  const { role } = useAuth();

  const handleAddToCart = (item) => {
    // If staff/admin is logged in, navigate to POS
    if (role === 'STAFF' || role === 'ADMIN') {
      setActiveTab('pos');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] selection:bg-amber-600 selection:text-white">
      {/* Navbar with Role switchers */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <div className="flex-1">
        {/* Customer tabs */}
        {activeTab === 'menu' && <MenuPage onAddToCart={handleAddToCart} />}
        {activeTab === 'booking' && <BookingPage />}
        {activeTab === 'loyalty' && <LoyaltyPage />}

        {/* Staff POS tabs */}
        {activeTab === 'pos' && (
          (role === 'STAFF' || role === 'ADMIN') ? (
            <POSPage />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto" />
              <h2 className="font-bold text-lg text-stone-900">Khu Vực Dành Cho Thu Ngân</h2>
              <p className="text-xs text-stone-500">
                Vui lòng đăng nhập bằng tài khoản Thu Ngân để sử dụng màn hình POS bán hàng.
              </p>
            </div>
          )
        )}

        {activeTab === 'active-orders' && (
          (role === 'STAFF' || role === 'ADMIN') ? (
            <ActiveOrdersPage />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto" />
              <h2 className="font-bold text-lg text-stone-900">Khu Vực Bếp & Quản Lý Đơn</h2>
              <p className="text-xs text-stone-500">
                Chỉ dành cho nhân viên nội bộ có quyền hạn. Vui lòng đăng nhập tài khoản nhân viên.
              </p>
            </div>
          )
        )}

        {/* Admin tabs */}
        {activeTab.startsWith('admin') && (
          role === 'ADMIN' ? (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              {activeTab === 'admin' && <AdminDashboard onNavigateTab={setActiveTab} />}
              {activeTab === 'admin-menu' && <MenuManagePage onBack={() => setActiveTab('admin')} />}
              {activeTab === 'admin-tables' && <TableManagePage onBack={() => setActiveTab('admin')} />}
              {activeTab === 'admin-vouchers' && <VoucherManagePage onBack={() => setActiveTab('admin')} />}
              {activeTab === 'admin-staff' && <StaffManagePage onBack={() => setActiveTab('admin')} />}
              {activeTab === 'admin-reservations' && <ReservationsPage onBack={() => setActiveTab('admin')} />}
              {activeTab === 'admin-points' && <PointAuditPage onBack={() => setActiveTab('admin')} />}
            </div>
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-purple-600 mx-auto" />
              <h2 className="font-bold text-lg text-stone-900">Khu Vực Dành Cho Quản Trị Viên</h2>
              <p className="text-xs text-stone-500">
                Vui lòng đăng nhập bằng tài khoản Quản Trị Viên (Admin) để quản lý cấu hình và nhân sự.
              </p>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Coffee className="w-5 h-5 text-amber-500" />
              <span className="font-extrabold text-base tracking-wide font-sans">README CAFE</span>
            </div>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Hệ thống đặt món tại quầy, đặt bàn trước trực tuyến & tích điểm hội viên thông minh chuẩn Enterprise.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">Vai Trò Hệ Thống</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>• <strong>Khách hàng:</strong> Xem thực đơn, đặt bàn, xem điểm & đổi voucher</li>
              <li>• <strong>Thu ngân:</strong> POS nhanh, tìm SĐT tích điểm (10k = 1đ), áp voucher</li>
              <li>• <strong>Admin:</strong> Quản lý menu, bàn ăn, kho voucher & nhân sự</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">Quy Chuẩn Kỹ Thuật</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>• <strong>Database:</strong> MongoDB & Mongoose ODM (11 thực thể)</li>
              <li>• <strong>Tài chính:</strong> DECIMAL độ chính xác cao chống sai số</li>
              <li>• <strong>Lịch đặt bàn:</strong> Thuật toán kiểm tra xung đột thời gian thực</li>
              <li>• <strong>Đối soát:</strong> Lưu vết mã đơn hàng và số dư điểm sau giao dịch</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">Tài Khoản Demo</h4>
            <div className="space-y-1 text-[11px] bg-stone-800/80 p-3 rounded-xl border border-stone-700/60 font-mono">
              <p>👑 Admin: <code>admin</code> / <code>admin123</code></p>
              <p>💵 Staff: <code>cashier1</code> / <code>staff123</code></p>
              <p>⭐ VIP Gold: <code>0987654321</code> / <code>123456</code></p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
          <span>© 2026 README Cafe & Loyalty System. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with React, Express, MongoDB & Tailwind CSS <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
