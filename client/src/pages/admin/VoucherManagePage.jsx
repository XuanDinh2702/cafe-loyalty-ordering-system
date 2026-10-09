import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, Tag, Calendar, Check, X } from 'lucide-react';
import { api, formatVND, formatDate } from '../../services/api';

export default function VoucherManagePage({ onBack }) {
  const [vouchers, setVouchers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    points_required: 10,
    discount_type: 'FIXED',
    discount_value: 20000,
    min_order_value: 50000,
    max_discount_amount: '',
    valid_days: 30,
    is_active: true
  });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const res = await api.getAllVouchers();
      setVouchers(res.vouchers || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = (v = null) => {
    if (v) {
      setEditingVoucher(v);
      setFormData({
        code: v.code,
        title: v.title,
        points_required: v.points_required,
        discount_type: v.discount_type,
        discount_value: v.discount_value,
        min_order_value: v.min_order_value || 0,
        max_discount_amount: v.max_discount_amount || '',
        valid_days: v.valid_days || 30,
        is_active: v.is_active
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: '',
        title: '',
        points_required: 10,
        discount_type: 'FIXED',
        discount_value: 20000,
        min_order_value: 50000,
        max_discount_amount: '',
        valid_days: 30,
        is_active: true
      });
    }
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    try {
      if (editingVoucher) {
        await api.updateVoucher(editingVoucher._id, formData);
      } else {
        await api.createVoucher(formData);
      }
      setIsModalOpen(false);
      loadVouchers();
    } catch (err) {
      setSubmitError(err.message || 'Lỗi lưu thông tin voucher');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Xóa voucher mã "${code}"?`)) return;
    try {
      await api.deleteVoucher(id);
      loadVouchers();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa voucher');
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
              Quản Lý Kho Voucher & Chương Trình Khuyến Mãi
            </h1>
            <p className="text-xs text-stone-500">Thiết lập điểm đổi thưởng, tỷ lệ giảm giá và hạn dùng</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Tạo Voucher Mới
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Voucher</th>
                <th className="py-3.5 px-4">Tiêu đề chương trình</th>
                <th className="py-3.5 px-4">Điểm đổi</th>
                <th className="py-3.5 px-4">Mức giảm</th>
                <th className="py-3.5 px-4">Điều kiện đơn</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {vouchers.map((v) => (
                <tr key={v._id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4 font-mono font-black text-amber-900 text-sm">
                    {v.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {v.title}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-amber-800">
                    {v.points_required} điểm
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-700">
                    {v.discount_type === 'PERCENTAGE'
                      ? `${v.discount_value}% ${v.max_discount_amount ? `(Max ${formatVND(v.max_discount_amount)})` : ''}`
                      : formatVND(v.discount_value)}
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    Đơn từ: {formatVND(v.min_order_value)} • Hạn: {v.valid_days} ngày
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      v.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {v.is_active ? 'Đang kích hoạt' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(v)}
                        className="p-2 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v._id, v.code)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              {editingVoucher ? 'Cập Nhật Mã Voucher' : 'Thiết Lập Chương Trình Voucher Mới'}
            </h3>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mã Voucher (Code) *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="VD: GIAM20K"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Số điểm cần đổi *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.points_required}
                    onChange={(e) => setFormData({ ...formData, points_required: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tên chương trình ưu đãi *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Giảm 20.000 VNĐ cho đồ uống"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Loại giảm *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                  >
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder="VD: 20000 hoặc 20"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    placeholder="Để trống nếu không giới hạn"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Thời hạn hiệu lực (Ngày sau khi đổi)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.valid_days}
                  onChange={(e) => setFormData({ ...formData, valid_days: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="v_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-amber-800 focus:ring-amber-700"
                />
                <label htmlFor="v_active" className="text-xs font-semibold text-stone-700">
                  Kích hoạt chương trình ngay lập tức
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 font-semibold rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs"
                >
                  Lưu Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
