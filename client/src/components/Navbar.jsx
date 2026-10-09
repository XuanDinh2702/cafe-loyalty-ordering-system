import React, { useState } from 'react';
import {
  Coffee,
  CalendarCheck,
  Award,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  User,
  ClipboardList,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomerAuthModal from '../pages/customer/CustomerAuthModal';
import { getTierBadge } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, role, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('LOGIN');

  const tierBadge = role === 'CUSTOMER' && user?.membership_tier ? getTierBadge(user.membership_tier) : null;

  const handleOpenLogin = () => {
    setAuthModalMode('LOGIN');
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalMode('REGISTER');
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedRole) => {
    if (loggedRole === 'ADMIN') {
      setActiveTab('admin');
    } else if (loggedRole === 'STAFF') {
      setActiveTab('pos');
    } else if (loggedRole === 'CUSTOMER') {
      setActiveTab('loyalty');
    }
  };

  const handleLogout = () => {
    logout();
    setActiveTab('menu');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-amber-100 shadow-md group-hover:scale-105 transition">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-stone-900 block leading-none">
                  README CAFE
                </span>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                  Loyalty & Dining
                </span>
              </div>
            </div>

            {/* Navigation Tabs (Filtered strictly by Role) */}
            <nav className="hidden md:flex items-center gap-1.5 flex-1 justify-center">
              {/* Public & Customer Tabs */}
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                  activeTab === 'menu'
                    ? 'bg-amber-100/90 text-amber-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Coffee className="w-4 h-4" /> Thực Đơn
              </button>

              <button
                onClick={() => setActiveTab('booking')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                  activeTab === 'booking'
                    ? 'bg-amber-100/90 text-amber-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <CalendarCheck className="w-4 h-4" /> Đặt Bàn Trước
              </button>

              {role !== 'STAFF' && (
                <button
                  onClick={() => setActiveTab('loyalty')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                    activeTab === 'loyalty'
                      ? 'bg-amber-100/90 text-amber-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-600" /> Tích Điểm & Voucher
                </button>
              )}

              {/* Staff / Admin Only Tabs */}
              {(role === 'STAFF' || role === 'ADMIN') && (
                <>
                  <button
                    onClick={() => setActiveTab('pos')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                      activeTab === 'pos'
                        ? 'bg-amber-800 text-white shadow-sm'
                        : 'text-amber-900 bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" /> Thu Ngân POS
                  </button>

                  <button
                    onClick={() => setActiveTab('active-orders')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                      activeTab === 'active-orders'
                        ? 'bg-amber-100/90 text-amber-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" /> Bếp & Đơn Hàng
                  </button>
                </>
              )}

              {/* Admin Only Tab */}
              {role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                    activeTab.startsWith('admin')
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-700 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Quản Trị Quán
                </button>
              )}
            </nav>

            {/* Right: Authentication Actions (Login / Register / Profile) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                // Logged in user profile badge
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => role === 'CUSTOMER' && setActiveTab('loyalty')}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-stone-200 bg-white shadow-xs ${
                      role === 'CUSTOMER' ? 'cursor-pointer hover:border-amber-400' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs shadow-2xs">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left text-xs leading-tight hidden sm:block">
                      <p className="font-bold text-stone-900 truncate max-w-[120px]">{user.full_name}</p>
                      {role === 'CUSTOMER' && (
                        <p className="text-[10px] text-amber-800 font-bold mt-0.5">
                          {user.current_points} điểm {tierBadge && `• ${user.membership_tier}`}
                        </p>
                      )}
                      {role === 'STAFF' && <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Thu Ngân</p>}
                      {role === 'ADMIN' && <p className="text-[10px] text-purple-700 font-bold mt-0.5">Quản Trị Viên</p>}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // Not logged in: Show "Đăng Ký" & "Đăng Nhập"
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenRegister}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4 text-stone-600" /> Đăng Ký
                  </button>
                  <button
                    onClick={handleOpenLogin}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    <User className="w-4 h-4" /> Đăng Nhập
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-stone-200 gap-1.5 bg-stone-50">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'menu' ? 'bg-amber-800 text-white' : 'text-stone-600'
            }`}
          >
            Thực Đơn
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'booking' ? 'bg-amber-800 text-white' : 'text-stone-600'
            }`}
          >
            Đặt Bàn
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'loyalty' ? 'bg-amber-800 text-white' : 'text-stone-600'
            }`}
          >
            Tích Điểm
          </button>
          {(role === 'STAFF' || role === 'ADMIN') && (
            <>
              <button
                onClick={() => setActiveTab('pos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  activeTab === 'pos' ? 'bg-amber-800 text-white' : 'text-stone-600'
                }`}
              >
                POS Thu Ngân
              </button>
              <button
                onClick={() => setActiveTab('active-orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  activeTab === 'active-orders' ? 'bg-amber-800 text-white' : 'text-stone-600'
                }`}
              >
                Bếp & Đơn
              </button>
            </>
          )}
          {role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab.startsWith('admin') ? 'bg-stone-900 text-white' : 'text-stone-600'
              }`}
            >
              Quản Trị
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal (Login / Register) */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
