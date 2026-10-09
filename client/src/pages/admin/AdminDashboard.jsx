import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Coffee,
  Users,
  Award,
  Layers,
  CalendarCheck,
  Tag,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { api, formatVND, formatDateTime } from '../../services/api';

export default function AdminDashboard({ onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setStats(res.stats);
    } catch (e) {
      console.error('Error loading admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Management Links */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-sans tracking-tight">
            Báo Cáo Hoạt Động & Quản Trị Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Tổng quan doanh thu, tỷ lệ lấp đầy bàn, quản lý menu và vòng đời điểm thưởng hội viên
          </p>
        </div>

        <button
          onClick={loadStats}
          className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Cập nhật số liệu
        </button>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => onNavigateTab('admin-menu')}
          className="p-4 bg-white hover:bg-amber-50/60 rounded-2xl border border-stone-200 text-left transition shadow-xs group"
        >
          <Coffee className="w-5 h-5 text-amber-800 mb-2 group-hover:scale-110 transition" />
          <h4 className="font-bold text-xs text-stone-900">Quản Lý Thực Đơn</h4>
          <p className="text-[11px] text-stone-400 mt-0.5">Món ăn & Giá bán</p>
        </button>

        <button
          onClick={() => onNavigateTab('admin-tables')}
          className="p-4 bg-white hover:bg-amber-50/60 rounded-2xl border border-stone-200 text-left transition shadow-xs group"
        >
          <Layers className="w-5 h-5 text-amber-800 mb-2 group-hover:scale-110 transition" />
          <h4 className="font-bold text-xs text-stone-900">Quản Lý Bàn Ăn</h4>
          <p className="text-[11px] text-stone-400 mt-0.5">Sơ đồ & Trạng thái</p>
        </button>

        <button
          onClick={() => onNavigateTab('admin-reservations')}
          className="p-4 bg-white hover:bg-amber-50/60 rounded-2xl border border-stone-200 text-left transition shadow-xs group"
        >
          <CalendarCheck className="w-5 h-5 text-amber-800 mb-2 group-hover:scale-110 transition" />
          <h4 className="font-bold text-xs text-stone-900">Lịch Đặt Bàn</h4>
          <p className="text-[11px] text-stone-400 mt-0.5">Giám sát & Xác nhận</p>
        </button>

        <button
          onClick={() => onNavigateTab('admin-vouchers')}
          className="p-4 bg-white hover:bg-amber-50/60 rounded-2xl border border-stone-200 text-left transition shadow-xs group"
        >
          <Tag className="w-5 h-5 text-amber-800 mb-2 group-hover:scale-110 transition" />
          <h4 className="font-bold text-xs text-stone-900">Kho Voucher</h4>
          <p className="text-[11px] text-stone-400 mt-0.5">Thiết lập khuyến mãi</p>
        </button>

        <button
          onClick={() => onNavigateTab('admin-staff')}
          className="p-4 bg-white hover:bg-amber-50/60 rounded-2xl border border-stone-200 text-left transition shadow-xs group"
        >
          <Users className="w-5 h-5 text-amber-800 mb-2 group-hover:scale-110 transition" />
          <h4 className="font-bold text-xs text-stone-900">Quản Lý Nhân Sự</h4>
          <p className="text-[11px] text-stone-400 mt-0.5">Tài khoản thu ngân</p>
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Doanh Thu Hôm Nay</span>
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-stone-900 font-sans">
              {formatVND(stats.todayRevenue)}
            </p>
            <div className="text-[11px] text-stone-500 flex justify-between pt-1 border-t border-stone-100">
              <span>Số đơn: <strong>{stats.todayOrdersCount}</strong></span>
              <span>Tháng này: <strong>{formatVND(stats.monthRevenue)}</strong></span>
            </div>
          </div>

          {/* Table Occupancy */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Tỷ Lệ Lấp Đầy Bàn</span>
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-900 font-sans">
              {stats.occupancyRate}%
            </p>
            <div className="text-[11px] text-stone-500 flex justify-between pt-1 border-t border-stone-100">
              <span>Đang ngồi: <strong>{stats.occupiedTables}/{stats.totalTables}</strong></span>
              <span>Đã đặt trước: <strong>{stats.reservedTables}</strong></span>
            </div>
          </div>

          {/* Loyalty Points Issued */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Điểm Đã Cấp (Earn)</span>
              <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-900 font-sans">
              {stats.pointsIssued.toLocaleString('vi-VN')} <span className="text-xs font-normal">điểm</span>
            </p>
            <div className="text-[11px] text-stone-500 flex justify-between pt-1 border-t border-stone-100">
              <span>Đã đổi voucher: <strong>{stats.pointsRedeemed} điểm</strong></span>
              <span>(10k = 1 điểm)</span>
            </div>
          </div>

          {/* Members Breakdown */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Cộng Đồng Hội Viên</span>
              <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-stone-900 font-sans">
              {stats.totalCustomers} <span className="text-xs font-normal">khách</span>
            </p>
            <div className="text-[11px] text-stone-500 flex justify-between pt-1 border-t border-stone-100">
              <span className="text-orange-700 font-bold">Đồng: {stats.customerTiers?.bronze}</span>
              <span className="text-slate-700 font-bold">Bạc: {stats.customerTiers?.silver}</span>
              <span className="text-amber-700 font-bold">Vàng: {stats.customerTiers?.gold}</span>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Columns: Top Items & Recent Orders */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top selling items */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-stone-900 flex items-center justify-between">
              <span>Món Bán Chạy Nhất (Top Sellers)</span>
              <span className="text-xs text-stone-400 font-normal">Xếp theo số lượng</span>
            </h3>

            <div className="space-y-3">
              {(stats.topItems || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-800 text-white font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">{item.name}</h4>
                      <p className="text-[11px] text-stone-500">Doanh thu: {formatVND(item.totalRevenue)}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-amber-900">
                    {item.totalSold} phần
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-stone-900 flex items-center justify-between">
              <span>Giao Dịch Gần Nhất</span>
              <button
                onClick={() => onNavigateTab('active-orders')}
                className="text-xs text-amber-800 font-bold hover:underline"
              >
                Xem tất cả
              </button>
            </h3>

            <div className="space-y-3">
              {(stats.recentOrders || []).map((ord) => (
                <div key={ord._id} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
                  <div>
                    <span className="font-mono font-bold text-stone-900">#{ord.order_code}</span>
                    <p className="text-[11px] text-stone-500">
                      {ord.customer_id ? ord.customer_id.full_name : 'Khách vãng lai'} • {formatDateTime(ord.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-stone-900 block">{formatVND(ord.total_amount)}</span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
