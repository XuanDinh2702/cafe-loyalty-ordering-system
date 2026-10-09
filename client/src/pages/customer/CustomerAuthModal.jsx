import React, { useState } from 'react';
import {
  X,
  Lock,
  Phone,
  User,
  Mail,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Coffee,
  Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CustomerAuthModal({ isOpen, onClose, initialMode = 'LOGIN', onAuthSuccess }) {
  const { loginCustomer, registerCustomer, loginStaff } = useAuth();
  const [tab, setTab] = useState(initialMode === 'REGISTER' ? 'REGISTER' : 'LOGIN'); // 'LOGIN' | 'REGISTER'
  const [loginType, setLoginType] = useState('CUSTOMER'); // 'CUSTOMER' | 'STAFF'

  // Customer form inputs
  const [phone, setPhone] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // Staff / Admin inputs
  const [username, setUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle manual submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'REGISTER') {
        const res = await registerCustomer({
          phone: phone.trim(),
          full_name: fullName.trim(),
          email: email.trim() || undefined,
          password: customerPassword
        });
        if (onAuthSuccess) onAuthSuccess('CUSTOMER');
        onClose();
      } else {
        // LOGIN
        if (loginType === 'CUSTOMER') {
          const res = await loginCustomer(phone.trim(), customerPassword);
          if (onAuthSuccess) onAuthSuccess('CUSTOMER');
          onClose();
        } else {
          // STAFF or ADMIN
          const res = await loginStaff(username.trim(), staffPassword);
          if (onAuthSuccess) onAuthSuccess(res.user?.role || 'STAFF');
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click login with the 3 pre-configured roles
  const handleQuickLogin = async (type) => {
    setError('');
    setLoading(true);
    try {
      if (type === 'ADMIN') {
        setLoginType('STAFF');
        setUsername('admin');
        setStaffPassword('admin123');
        const res = await loginStaff('admin', 'admin123');
        if (onAuthSuccess) onAuthSuccess('ADMIN');
        onClose();
      } else if (type === 'STAFF') {
        setLoginType('STAFF');
        setUsername('cashier1');
        setStaffPassword('staff123');
        const res = await loginStaff('cashier1', 'staff123');
        if (onAuthSuccess) onAuthSuccess('STAFF');
        onClose();
      } else if (type === 'CUSTOMER') {
        setLoginType('CUSTOMER');
        setPhone('0987654321');
        setCustomerPassword('123456');
        const res = await loginCustomer('0987654321', '123456');
        if (onAuthSuccess) onAuthSuccess('CUSTOMER');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Lỗi đăng nhập nhanh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-stone-900 to-amber-950 text-white p-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5 text-amber-400">
            <Coffee className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase">README CAFE</span>
          </div>
          <h3 className="font-extrabold text-xl tracking-tight text-white font-sans">
            {tab === 'LOGIN' ? 'Đăng Nhập Hệ Thống' : 'Đăng Ký Hội Viên Mới'}
          </h3>
          <p className="text-xs text-stone-300 mt-0.5">
            {tab === 'LOGIN'
              ? 'Truy cập tài khoản hội viên tích điểm hoặc quyền hạn thu ngân/quản trị'
              : 'Tích 1 điểm cho mỗi 10.000đ, nâng hạng thành viên & đổi voucher'}
          </p>
        </div>

        {/* Main Tab Switcher (Đăng Nhập / Đăng Ký) */}
        <div className="flex border-b border-stone-200 bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => { setTab('LOGIN'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              tab === 'LOGIN'
                ? 'bg-white shadow text-amber-900'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setTab('REGISTER'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              tab === 'REGISTER'
                ? 'bg-white shadow text-amber-900'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* If LOGIN tab, show role toggle (Khách Hàng vs Nhân Viên/Admin) */}
          {tab === 'LOGIN' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setLoginType('CUSTOMER'); setError(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  loginType === 'CUSTOMER'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Khách Hàng (SĐT)
              </button>
              <button
                type="button"
                onClick={() => { setLoginType('STAFF'); setError(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  loginType === 'STAFF'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Thu Ngân / Admin
              </button>
            </div>
          )}

          {/* Quick 1-Click Role Accounts Box */}
          {tab === 'LOGIN' && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Chọn nhanh tài khoản mẫu:
                </span>
                <span className="text-[10px] text-amber-700 italic">Bấm để đăng nhập ngay</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ADMIN')}
                  disabled={loading}
                  className="p-2 bg-white hover:bg-stone-900 hover:text-white border border-stone-200 rounded-xl text-center transition group shadow-2xs"
                >
                  <span className="text-[10px] block font-black uppercase text-purple-700 group-hover:text-purple-300">
                    Admin
                  </span>
                  <span className="text-[11px] font-bold block text-stone-800 group-hover:text-white truncate">
                    admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('STAFF')}
                  disabled={loading}
                  className="p-2 bg-white hover:bg-amber-800 hover:text-white border border-stone-200 rounded-xl text-center transition group shadow-2xs"
                >
                  <span className="text-[10px] block font-black uppercase text-emerald-700 group-hover:text-emerald-300">
                    Thu Ngân
                  </span>
                  <span className="text-[11px] font-bold block text-stone-800 group-hover:text-white truncate">
                    cashier1
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('CUSTOMER')}
                  disabled={loading}
                  className="p-2 bg-white hover:bg-amber-600 hover:text-white border border-stone-200 rounded-xl text-center transition group shadow-2xs"
                >
                  <span className="text-[10px] block font-black uppercase text-amber-600 group-hover:text-amber-200">
                    Khách VIP
                  </span>
                  <span className="text-[11px] font-bold block text-stone-800 group-hover:text-white truncate">
                    0987...21
                  </span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'REGISTER' ? (
              // REGISTER FORM
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Số điện thoại * <span className="text-[11px] text-stone-400 font-normal">(Dùng để tích điểm tại quầy)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ví dụ: 0912345678"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Họ và tên *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mật khẩu *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email <span className="text-[11px] text-stone-400 font-normal">(Không bắt buộc)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>
              </>
            ) : loginType === 'CUSTOMER' ? (
              // CUSTOMER LOGIN FORM
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Số điện thoại hội viên</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0987654321"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>
              </>
            ) : (
              // STAFF / ADMIN LOGIN FORM
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Tên đăng nhập nội bộ</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin hoặc cashier1"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50 mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Đang xác thực...'
              ) : tab === 'REGISTER' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Đăng Ký Tài Khoản Mới
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" /> Đăng Nhập Ngay
                </>
              )}
            </button>
          </form>

          {/* Footer switch prompt */}
          <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100">
            {tab === 'LOGIN' ? (
              <p>
                Chưa có tài khoản hội viên?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('REGISTER'); setError(''); }}
                  className="font-bold text-amber-800 hover:underline"
                >
                  Đăng ký ngay tại đây
                </button>
              </p>
            ) : (
              <p>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('LOGIN'); setError(''); }}
                  className="font-bold text-amber-800 hover:underline"
                >
                  Quay lại đăng nhập
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
