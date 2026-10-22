import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Printer,
  Coffee,
  ShoppingBag,
  RefreshCw,
  Search
} from 'lucide-react';
import { api, formatVND, formatDateTime } from '../../services/api';
import ReceiptModal from '../../components/ReceiptModal';

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000); // 15s auto-poll
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const query = `?status=${statusFilter}${search ? `&search=${search}` : ''}&limit=30`;
      const res = await api.getOrders(query);
      setOrders(res.orders || []);
    } catch (e) {
      console.error('Error loading orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setActionNotice(`Đã chuyển đơn sang trạng thái ${newStatus}`);
      setTimeout(() => setActionNotice(''), 3000);
      loadOrders();
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật');
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${order.order_code}? Điểm tích lũy và voucher (nếu có) sẽ được hoàn trả lại cho khách.`)) {
      return;
    }

    try {
      const res = await api.cancelOrder(order._id);
      setActionNotice(res.message || 'Đã hủy đơn thành công');
      setTimeout(() => setActionNotice(''), 4000);
      loadOrders();
    } catch (err) {
      alert(err.message || 'Lỗi hủy đơn');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 font-sans">
              Quản Lý Đơn Hàng & Điều Phối Barista
            </h1>
            <p className="text-xs text-stone-500">
              Giám sát tiến độ chế biến, thanh toán và xử lý hoàn hủy đơn hàng
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
        </div>

        {actionNotice && (
          <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st === 'all' && 'Tất cả'}
                {st === 'PENDING' && 'Chờ nhận'}
                {st === 'PREPARING' && 'Đang pha chế'}
                {st === 'READY' && 'Sẵn sàng giao'}
                {st === 'COMPLETED' && 'Hoàn thành'}
                {st === 'CANCELLED' && 'Đã hủy'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
              placeholder="Tìm mã đơn hàng..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
            />
          </div>
        </div>

        {/* Orders Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
            <Coffee className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">Không có đơn hàng nào theo bộ lọc</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((o) => (
              <div
                key={o._id}
                className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div>
                    <span className="font-mono font-bold text-sm text-stone-900 block">
                      #{o.order_code}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDateTime(o.created_at)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    o.status === 'READY' ? 'bg-sky-100 text-sky-800' :
                    o.status === 'PREPARING' ? 'bg-amber-100 text-amber-800' :
                    o.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-stone-200 text-stone-800'
                  }`}>
                    {o.status === 'COMPLETED' && 'Hoàn tất'}
                    {o.status === 'READY' && 'Sẵn sàng'}
                    {o.status === 'PREPARING' && 'Đang làm'}
                    {o.status === 'PENDING' && 'Chờ nhận'}
                    {o.status === 'CANCELLED' && 'Đã hủy'}
                  </span>
                </div>

                {/* Info row */}
                <div className="text-xs space-y-1.5 text-stone-600">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Hình thức:</span>
                    {o.order_type === 'DINE_IN' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300">
                        ☕ Bàn {o.table_id?.table_number || 'Chưa gán'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold text-xs">
                        🛍️ Mang về
                      </span>
                    )}
                  </div>

                  {o.customer_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Khách hàng:</span>
                      <strong className="text-stone-800 truncate max-w-[170px]">
                        {o.customer_id.full_name} ({o.customer_id.phone})
                      </strong>
                    </div>
                  )}

                  {/* Items List directly visible for Barista */}
                  {o.items && o.items.length > 0 && (
                    <div className="bg-stone-50/80 rounded-xl p-2.5 my-2 border border-stone-200/70 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Danh sách món ({o.items.reduce((sum, it) => sum + (it.quantity || 1), 0)} ly/phần)
                      </div>
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex items-start justify-between text-xs pt-1 border-t border-stone-200/40 first:border-t-0 first:pt-0">
                          <div>
                            <span className="font-extrabold text-stone-900">
                              {it.quantity}x
                            </span>{' '}
                            <span className="text-stone-800 font-medium">{it.item_name}</span>
                            {it.note && (
                              <span className="block text-[11px] text-amber-800 font-semibold italic">
                                👉 {it.note}
                              </span>
                            )}
                          </div>
                          <span className="text-stone-500 font-mono text-[11px] ml-2">
                            {formatVND(it.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {o.notes && (
                    <div className="px-2.5 py-1.5 bg-amber-50 rounded-lg text-[11px] text-amber-900 border border-amber-200/60 font-medium">
                      📝 {o.notes}
                    </div>
                  )}

                  <div className="flex justify-between pt-1 border-t border-stone-100">
                    <span className="text-stone-500">Tổng tiền:</span>
                    <span className="font-black text-amber-950 text-sm">
                      {formatVND(o.total_amount)}
                    </span>
                  </div>

                  {o.points_earned > 0 && (
                    <div className="flex justify-between text-[11px] text-emerald-700 font-medium">
                      <span>Tích lũy:</span>
                      <span>+{o.points_earned} điểm</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={async () => {
                      const res = await api.getOrderById(o._id);
                      setSelectedOrderForReceipt(res.order);
                    }}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
                    title="Xem hóa đơn & in"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    {o.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(o._id, 'READY')}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        Báo Sẵn Sàng
                      </button>
                    )}

                    {o.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(o._id, 'COMPLETED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        Giao Khách (Xong)
                      </button>
                    )}

                    {o.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelOrder(o)}
                        className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium transition"
                        title="Hủy đơn & hoàn điểm/voucher"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedOrderForReceipt && (
        <ReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
}
