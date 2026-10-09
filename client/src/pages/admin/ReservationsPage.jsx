import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, Users, CheckCircle, XCircle } from 'lucide-react';
import { api, formatDateTime } from '../../services/api';

export default function ReservationsPage({ onBack }) {
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, [statusFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await api.getReservations(`?status=${statusFilter}`);
      setReservations(res.reservations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateReservationStatus(id, status);
      loadReservations();
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-stone-900 font-sans">
              Giám Sát Lịch Đặt Bàn Trước
            </h1>
            <p className="text-xs text-stone-500">Kiểm tra thông tin khách đến nhận bàn, xử lý xác nhận và hủy lịch</p>
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 bg-white p-1 rounded-2xl border border-stone-200 text-xs">
          {['all', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === st
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'all' && 'Tất cả'}
              {st === 'CONFIRMED' && 'Đã xác nhận'}
              {st === 'PENDING' && 'Chờ duyệt'}
              {st === 'COMPLETED' && 'Đã nhận bàn'}
              {st === 'CANCELLED' && 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Bàn & Khu vực</th>
                <th className="py-3.5 px-4">Thời gian nhận bàn</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Số lượng</th>
                <th className="py-3.5 px-4">Yêu cầu riêng</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservations.map((r) => (
                <tr key={r._id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4">
                    <span className="font-black text-stone-900 text-sm block">
                      Bàn {r.table_id?.table_number || 'N/A'}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {r.table_id?.area} ({r.table_id?.capacity} chỗ)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-stone-900">{formatDateTime(r.start_time)}</p>
                    <p className="text-[11px] text-stone-500">đến {formatDateTime(r.end_time)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 block">{r.customer_id?.full_name}</span>
                    <span className="font-mono text-stone-500 text-[11px]">{r.customer_id?.phone}</span>
                  </td>
                  <td className="py-3 px-4 text-stone-700 font-semibold">
                    {r.guest_count} khách
                  </td>
                  <td className="py-3 px-4 text-stone-500 italic max-w-xs truncate">
                    {r.note || 'Không có ghi chú'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      r.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'COMPLETED' ? 'bg-sky-100 text-sky-800' :
                      r.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(r._id, 'COMPLETED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                        >
                          Khách Đã Đến
                        </button>
                      )}
                      {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateStatus(r._id, 'CANCELLED')}
                          className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
