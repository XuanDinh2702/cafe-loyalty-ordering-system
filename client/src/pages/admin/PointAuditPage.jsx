import React, { useState, useEffect } from 'react';
import { Award, ArrowLeft, Clock } from 'lucide-react';
import { api, formatDateTime, formatVND } from '../../services/api';

export default function PointAuditPage({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [typeFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.getPointAudit(`?type=${typeFilter}`);
      setTransactions(res.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
              Nhật Ký Đối Soát Điểm Thưởng (Point Audit Trail)
            </h1>
            <p className="text-xs text-stone-500">Toàn bộ vết tích cộng/trừ điểm liên kết đơn hàng và đổi quà voucher</p>
          </div>
        </div>

        <div className="flex gap-1.5 bg-white p-1 rounded-2xl border border-stone-200 text-xs">
          {['all', 'EARN', 'REDEEM', 'ADJUST'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                typeFilter === t
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t === 'all' && 'Tất cả'}
              {t === 'EARN' && '+ Cộng điểm (Tích lũy)'}
              {t === 'REDEEM' && '- Trừ điểm (Đổi quà)'}
              {t === 'ADJUST' && 'Hoàn trả (Hủy đơn)'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Loại GD</th>
                <th className="py-3.5 px-4">Điểm biến động</th>
                <th className="py-3.5 px-4">Số dư sau GD</th>
                <th className="py-3.5 px-4">Nội dung đối soát</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    {formatDateTime(t.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 block">{t.customer_id?.full_name}</span>
                    <span className="font-mono text-stone-500 text-[11px]">{t.customer_id?.phone}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      t.type === 'EARN' ? 'bg-emerald-100 text-emerald-800' :
                      t.type === 'REDEEM' ? 'bg-amber-100 text-amber-800' :
                      'bg-stone-200 text-stone-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`py-3 px-4 font-black text-sm ${
                    t.points > 0 ? 'text-emerald-700' : 'text-amber-800'
                  }`}>
                    {t.points > 0 ? `+${t.points}` : t.points} điểm
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-800">
                    {t.balance_after} điểm
                  </td>
                  <td className="py-3 px-4 text-stone-700">
                    {t.description}
                    {t.order_id && (
                      <span className="block text-[11px] text-stone-400">
                        Đơn hàng: #{t.order_id.order_code} ({formatVND(t.order_id.total_amount)})
                      </span>
                    )}
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
