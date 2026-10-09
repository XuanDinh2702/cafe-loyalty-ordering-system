import React, { useState, useEffect } from 'react';
import { Award, Gift, Clock, Sparkles, CheckCircle, Tag, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { api, formatVND, formatDateTime, formatDate, getTierBadge } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CustomerAuthModal from './CustomerAuthModal';

export default function LoyaltyPage() {
  const { user, role, quickSwitch } = useAuth();
  const [activeTab, setActiveTab] = useState('redeem'); // 'redeem' | 'my-vouchers' | 'history'

  const [profile, setProfile] = useState(null);
  const [tierInfo, setTierInfo] = useState(null);
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isCustomer = role === 'CUSTOMER' && user;

  useEffect(() => {
    loadVouchersStore();
    if (isCustomer) {
      loadCustomerData();
    }
  }, [user, role]);

  const loadVouchersStore = async () => {
    try {
      const res = await api.getActiveVouchers();
      setActiveVouchers(res.vouchers || []);
    } catch (e) {
      console.error('Error fetching vouchers store:', e);
    }
  };

  const loadCustomerData = async () => {
    if (!user?._id && !user?.id) return;
    const cid = user._id || user.id;

    try {
      setLoading(true);
      const [profRes, vouchersRes, histRes] = await Promise.all([
        api.getCustomerProfile(cid),
        api.getCustomerVouchers(cid),
        api.getCustomerPoints(cid)
      ]);

      setProfile(profRes.customer);
      setTierInfo(profRes.tierInfo);
      setMyVouchers(vouchersRes.vouchers || []);
      setTransactions(histRes.transactions || []);
    } catch (e) {
      console.error('Error loading customer data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (voucher) => {
    if (!isCustomer) {
      setActionError('Vui lòng đăng nhập tài khoản khách hàng để đổi quà');
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      const cid = user._id || user.id;
      const res = await api.redeemVoucher({ customer_id: cid, voucher_id: voucher._id });
      setActionSuccess(`Chúc mừng! Đổi thành công mã "${voucher.title}". Bạn có thể sử dụng tại quầy thanh toán.`);
      // Reload customer data
      loadCustomerData();
    } catch (err) {
      setActionError(err.message || 'Không thể đổi mã ưu đãi này');
    }
  };

  const badge = profile?.membership_tier ? getTierBadge(profile.membership_tier) : null;

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Chương Trình Khách Hàng Thân Thiết
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-sans">
            Tích Điểm Tận Hưởng – Đổi Ngàn Ưu Đãi
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm max-w-xl mx-auto">
            Mỗi 10.000 VNĐ chi tiêu tích ngay 1 điểm hội viên. Nâng hạng thành viên Đồng, Bạc, Vàng và đổi các voucher giảm giá đồ uống độc quyền.
          </p>
        </div>

        {/* If not logged in as customer, prompt */}
        {!isCustomer && (
          <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/30">
                Chưa Đăng Nhập Hội Viên
              </span>
              <h2 className="text-2xl font-bold">Xem Điểm & Quản Lý Mã Giảm Giá Của Bạn</h2>
              <p className="text-stone-300 text-xs sm:text-sm max-w-lg">
                Đăng nhập hoặc đăng ký tài khoản bằng số điện thoại để kiểm tra số điểm tích lũy và mở khóa các đặc quyền hội viên.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg text-center whitespace-nowrap"
              >
                Đăng Nhập / Đăng Ký Hội Viên
              </button>
            </div>
          </div>
        )}

        {/* Customer Membership Card & Progress */}
        {isCustomer && profile && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* VIP Card */}
            <div className="md:col-span-5 relative rounded-3xl p-6 sm:p-7 text-white shadow-xl overflow-hidden flex flex-col justify-between min-h-[220px] bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 border border-amber-800/40">
              <div className="absolute -right-10 -bottom-10 opacity-10 text-white">
                <Award className="w-56 h-56" />
              </div>

              {/* Top row */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300 font-sans">
                    README Member Card
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  profile.membership_tier === 'GOLD' ? 'bg-amber-400 text-stone-950' :
                  profile.membership_tier === 'SILVER' ? 'bg-slate-200 text-stone-900' :
                  'bg-orange-700 text-white'
                }`}>
                  Hạng {profile.membership_tier}
                </span>
              </div>

              {/* Center: Points */}
              <div className="my-4 z-10">
                <span className="text-xs text-stone-300 uppercase tracking-wider block">Điểm khả dụng</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-amber-300 font-sans">
                    {profile.current_points}
                  </span>
                  <span className="text-sm font-semibold text-stone-300">điểm</span>
                </div>
              </div>

              {/* Bottom: Name & Phone */}
              <div className="flex items-end justify-between z-10 border-t border-white/10 pt-3">
                <div>
                  <p className="font-bold text-sm tracking-wide text-white">{profile.full_name}</p>
                  <p className="text-xs text-stone-400 font-mono">{profile.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-stone-400">Tổng chi tiêu</p>
                  <p className="text-xs font-bold text-amber-200">{formatVND(profile.total_spent)}</p>
                </div>
              </div>
            </div>

            {/* Tier Progress Info */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-700" /> Tiến Trình Thăng Hạng Hội Viên
                  </h3>
                  <span className="text-xs font-semibold text-stone-500">
                    {tierInfo?.currentTier}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-600 font-medium">Hạng kế tiếp:</span>
                    <span className="font-bold text-amber-800">
                      {tierInfo?.nextTier ? tierInfo.nextTier : 'Đã đạt cấp độ cao nhất (Gold)'}
                    </span>
                  </div>

                  {tierInfo?.nextTier && (
                    <>
                      <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
                        <div
                          className="bg-gradient-to-r from-amber-600 to-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${tierInfo?.progressPercentage || 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-stone-500">
                        <span>Đã tích lũy: {formatVND(profile.total_spent)}</span>
                        <span>Cần thêm {formatVND(tierInfo?.spendNeeded)} để lên {tierInfo?.nextTier}</span>
                      </div>
                    </>
                  )}

                  <div className="p-3 bg-stone-50 rounded-2xl text-[11px] text-stone-600 space-y-1">
                    <p className="font-semibold text-stone-800">Cơ chế phân hạng thành viên:</p>
                    <p>• <strong>Đồng (Bronze):</strong> Chi tiêu dưới 1.000.000 VNĐ</p>
                    <p>• <strong>Bạc (Silver):</strong> Chi tiêu từ 1.000.000 VNĐ đến 5.000.000 VNĐ</p>
                    <p>• <strong>Vàng (Gold):</strong> Chi tiêu từ 5.000.000 VNĐ trở lên (Ưu tiên bàn VIP)</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Số voucher hiện có: <strong className="text-stone-900">{myVouchers.filter(v => v.status === 'AVAILABLE').length}</strong></span>
                <span>Số giao dịch điểm: <strong className="text-stone-900">{transactions.length}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs flex items-center gap-2">
            <Tag className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 gap-2">
          <button
            onClick={() => setActiveTab('redeem')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'redeem'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Gift className="w-4 h-4" /> Kho Ưu Đãi Đổi Điểm ({activeVouchers.length})
          </button>
          <button
            onClick={() => setActiveTab('my-vouchers')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'my-vouchers'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Ticket className="w-4 h-4" /> Ví Voucher Của Tôi ({myVouchers.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-4 h-4" /> Lịch Sử Điểm Thưởng ({transactions.length})
          </button>
        </div>

        {/* Tab 1: Redeem Store */}
        {activeTab === 'redeem' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeVouchers.map((v) => {
              const canAfford = isCustomer && (profile?.current_points || 0) >= v.points_required;
              return (
                <div
                  key={v._id}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl tracking-wider">
                        {v.code}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        {v.points_required} Điểm
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900 leading-snug">{v.title}</h3>

                    <div className="space-y-1 text-xs text-stone-500">
                      <p>
                        • Mức giảm: <strong className="text-emerald-700">
                          {v.discount_type === 'PERCENTAGE'
                            ? `Giảm ${v.discount_value}%`
                            : `Giảm ${formatVND(v.discount_value)}`}
                        </strong>
                      </p>
                      {v.min_order_value > 0 && (
                        <p>• Áp dụng cho đơn từ: {formatVND(v.min_order_value)}</p>
                      )}
                      {v.max_discount_amount && (
                        <p>• Giảm tối đa: {formatVND(v.max_discount_amount)}</p>
                      )}
                      <p>• Hạn dùng: Trong vòng {v.valid_days || 30} ngày sau khi đổi</p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-stone-100">
                    <button
                      onClick={() => handleRedeem(v)}
                      disabled={isCustomer && !canAfford}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        canAfford || !isCustomer
                          ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {isCustomer
                        ? canAfford ? 'Đổi Điểm Ngay' : `Thiếu ${v.points_required - (profile?.current_points || 0)} điểm`
                        : 'Đăng nhập để đổi'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: My Vouchers */}
        {activeTab === 'my-vouchers' && (
          <div>
            {!isCustomer ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6">
                <Ticket className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-700">Vui lòng đăng nhập để xem kho voucher của bạn</p>
              </div>
            ) : myVouchers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
                <Gift className="w-12 h-12 text-stone-300 mx-auto" />
                <h4 className="font-bold text-stone-800">Bạn chưa có mã giảm giá nào</h4>
                <p className="text-xs text-stone-500">Hãy dùng điểm tích lũy đổi voucher ở tab "Kho Ưu Đãi Đổi Điểm".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myVouchers.map((cv) => {
                  const v = cv.voucher_id || {};
                  return (
                    <div
                      key={cv._id}
                      className={`bg-white rounded-3xl p-5 border shadow-xs flex flex-col justify-between relative ${
                        cv.status === 'AVAILABLE'
                          ? 'border-amber-300 bg-gradient-to-b from-amber-50/40 to-white'
                          : 'border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-sm px-3 py-1 bg-stone-900 text-amber-300 rounded-xl">
                            {v.code}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            cv.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                            cv.status === 'USED' ? 'bg-stone-200 text-stone-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {cv.status === 'AVAILABLE' && 'Sẵn sàng dùng'}
                            {cv.status === 'USED' && 'Đã sử dụng'}
                            {cv.status === 'EXPIRED' && 'Hết hạn'}
                          </span>
                        </div>

                        <h4 className="font-bold text-stone-900 text-sm mt-1">{v.title}</h4>

                        <div className="text-xs text-stone-500 space-y-0.5">
                          <p>• Hạn sử dụng: <strong>{formatDate(cv.expires_at)}</strong></p>
                          {v.min_order_value && <p>• Đơn tối thiểu: {formatVND(v.min_order_value)}</p>}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-stone-100 text-[11px] text-stone-400">
                        {cv.status === 'AVAILABLE' && (
                          <span className="text-amber-800 font-medium">
                            Đọc mã này cho thu ngân khi thanh toán tại quầy
                          </span>
                        )}
                        {cv.status === 'USED' && (
                          <span>Đã dùng lúc: {formatDateTime(cv.used_at)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            {!isCustomer ? (
              <div className="text-center py-16 p-6">
                <Clock className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-700">Vui lòng đăng nhập để xem lịch sử tích điểm</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16 p-6">
                <Clock className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-700">Chưa có giao dịch tích hoặc đổi điểm nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Thời gian</th>
                      <th className="py-3.5 px-4">Loại giao dịch</th>
                      <th className="py-3.5 px-4">Số điểm</th>
                      <th className="py-3.5 px-4">Số dư sau GD</th>
                      <th className="py-3.5 px-4">Nội dung chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {transactions.map((t) => (
                      <tr key={t._id} className="hover:bg-stone-50/50">
                        <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                          {formatDateTime(t.created_at)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            t.type === 'EARN' ? 'bg-emerald-100 text-emerald-800' :
                            t.type === 'REDEEM' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {t.type === 'EARN' && '+ Cộng điểm'}
                            {t.type === 'REDEEM' && '- Tiêu điểm'}
                            {t.type === 'ADJUST' && 'Điều chỉnh'}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 font-black text-sm whitespace-nowrap ${
                          t.points > 0 ? 'text-emerald-700' : 'text-amber-800'
                        }`}>
                          {t.points > 0 ? `+${t.points}` : t.points} điểm
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-800 whitespace-nowrap">
                          {t.balance_after} điểm
                        </td>
                        <td className="py-3.5 px-4 text-stone-700">
                          {t.description}
                          {t.order_id && (
                            <span className="block text-[11px] text-stone-400">
                              Hóa đơn: #{t.order_id.order_code || t.order_id} ({formatVND(t.order_id.total_amount)})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="LOGIN"
      />
    </div>
  );
}
