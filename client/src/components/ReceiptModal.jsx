import React from 'react';
import { Printer, X, CheckCircle, Coffee, Award } from 'lucide-react';
import { formatVND, formatDateTime } from '../services/api';

export default function ReceiptModal({ order, items, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-100 border-b border-stone-200">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle className="w-5 h-5" />
            <span>Thanh Toán Thành Công</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition"
              title="In hóa đơn"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="receipt-print-area" className="p-6 font-mono text-xs leading-relaxed text-stone-800 bg-white">
          <div className="text-center pb-4 border-b border-dashed border-stone-300">
            <div className="flex justify-center mb-1 text-amber-800">
              <Coffee className="w-7 h-7" />
            </div>
            <h2 className="font-bold text-base tracking-wider uppercase font-sans text-stone-900">README CAFE & LOUNGE</h2>
            <p className="text-[11px] text-stone-500 font-sans">123 Đường Cà Phê, Quận 1, TP. Hồ Chí Minh</p>
            <p className="text-[11px] text-stone-500 font-sans">Hotline: 1900 6868 - Wifi: readmecafe / 88888888</p>
            <h3 className="font-bold text-sm mt-2 text-stone-900 uppercase">HÓA ĐƠN BÁN HÀNG</h3>
            <p className="text-stone-600">Số HĐ: #{order.order_code}</p>
          </div>

          {/* Metadata */}
          <div className="py-3 border-b border-dashed border-stone-300 space-y-1">
            <div className="flex justify-between">
              <span>Thời gian:</span>
              <span>{formatDateTime(order.created_at || order.paid_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Hình thức:</span>
              <span className="font-semibold uppercase">{order.order_type === 'DINE_IN' ? 'Tại quán' : 'Mang về'}</span>
            </div>
            {order.table_id && (
              <div className="flex justify-between font-bold">
                <span>Vị trí bàn:</span>
                <span>Bàn {order.table_id.table_number || order.table_id} ({order.table_id.area || 'Trong nhà'})</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Thu ngân:</span>
              <span>{order.staff_id?.full_name || 'Hệ thống POS'}</span>
            </div>
            {order.customer_id && (
              <div className="flex justify-between text-amber-900 bg-amber-50 px-2 py-1 rounded mt-1 font-sans">
                <span>Khách hàng:</span>
                <span className="font-semibold">{order.customer_id.full_name} ({order.customer_id.phone})</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-stone-300">
            <div className="grid grid-cols-12 font-bold mb-2 text-stone-900 border-b pb-1">
              <span className="col-span-6">Tên món</span>
              <span className="col-span-2 text-center">SL</span>
              <span className="col-span-4 text-right">Thành tiền</span>
            </div>
            <div className="space-y-2">
              {(items || order.items || []).map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 text-stone-700">
                  <div className="col-span-6">
                    <p className="font-sans font-medium text-stone-900">{it.item_name}</p>
                    {it.note && <p className="text-[10px] text-stone-500 italic">*{it.note}</p>}
                  </div>
                  <div className="col-span-2 text-center font-semibold">{it.quantity}</div>
                  <div className="col-span-4 text-right">{formatVND(it.total_price)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="py-3 space-y-1.5 border-b border-dashed border-stone-300 font-sans">
            <div className="flex justify-between text-stone-600">
              <span>Tổng tiền hàng:</span>
              <span>{formatVND(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Giảm giá (Voucher):</span>
                <span>-{formatVND(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-stone-900 pt-1 border-t">
              <span>THANH TOÁN:</span>
              <span className="text-amber-800">{formatVND(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-stone-600 text-[11px] pt-1">
              <span>Phương thức:</span>
              <span className="font-semibold">
                {order.payment_method === 'CASH' && 'Tiền mặt'}
                {order.payment_method === 'TRANSFER' && 'Chuyển khoản VietQR'}
                {order.payment_method === 'CARD' && 'Quẹt thẻ'}
              </span>
            </div>
          </div>

          {/* Loyalty Section */}
          {order.customer_id && (
            <div className="my-3 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950 font-sans">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" /> Điểm tích lũy hóa đơn này:
                </span>
                <span className="text-emerald-700 text-sm">+{order.points_earned} điểm</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                (Quy tắc: 10.000 VNĐ chi tiêu thực trả = 1 điểm hội viên)
              </p>
            </div>
          )}

          {/* Footer note */}
          <div className="text-center pt-3 text-stone-500 text-[11px] font-sans">
            <p className="font-semibold text-stone-800">Cảm ơn Quý Khách & Hẹn Gặp Lại!</p>
            <p>Pass Wifi: readmecafe2026</p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Printer className="w-4 h-4" /> In Hóa Đơn
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-xl transition shadow-sm"
          >
            Xong / Đơn Tiếp Theo
          </button>
        </div>
      </div>
    </div>
  );
}
