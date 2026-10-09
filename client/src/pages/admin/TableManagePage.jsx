import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, Layers, Users } from 'lucide-react';
import { api } from '../../services/api';

export default function TableManagePage({ onBack }) {
  const [tables, setTables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 4,
    area: 'INDOOR',
    status: 'AVAILABLE'
  });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const res = await api.getTables();
      setTables(res.tables || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        area: table.area,
        status: table.status
      });
    } else {
      setEditingTable(null);
      setFormData({
        table_number: '',
        capacity: 4,
        area: 'INDOOR',
        status: 'AVAILABLE'
      });
    }
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    try {
      if (editingTable) {
        await api.updateTable(editingTable._id, formData);
      } else {
        await api.createTable(formData);
      }
      setIsModalOpen(false);
      loadTables();
    } catch (err) {
      setSubmitError(err.message || 'Lỗi lưu thông tin bàn');
    }
  };

  const handleDelete = async (id, num) => {
    if (!window.confirm(`Xóa bàn ${num}?`)) return;
    try {
      await api.deleteTable(id);
      loadTables();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa');
    }
  };

  const handleQuickStatus = async (tableId, newStatus) => {
    try {
      await api.updateTableStatus(tableId, newStatus);
      loadTables();
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
              Quản Lý Bàn Ăn & Sơ Đồ Chỗ Ngồi
            </h1>
            <p className="text-xs text-stone-500">Cấu hình khu vực, sức chứa và kiểm soát trạng thái thời gian thực</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Thêm Bàn Mới
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Số hiệu bàn</th>
                <th className="py-3.5 px-4">Sức chứa</th>
                <th className="py-3.5 px-4">Khu vực</th>
                <th className="py-3.5 px-4">Trạng thái hiện tại</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tables.map((t) => (
                <tr key={t._id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4 font-black text-stone-900 text-sm">
                    {t.table_number}
                  </td>
                  <td className="py-3 px-4 text-stone-700 font-medium">
                    {t.capacity} khách
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px]">
                      {t.area === 'INDOOR' && 'Phòng Lạnh (Indoor)'}
                      {t.area === 'OUTDOOR' && 'Sân Vườn (Outdoor)'}
                      {t.area === 'ROOFTOP' && 'Tầng Thượng (Rooftop)'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={t.status}
                      onChange={(e) => handleQuickStatus(t._id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:ring-1 ${
                        t.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        t.status === 'OCCUPIED' ? 'bg-red-50 text-red-800 border-red-300' :
                        t.status === 'RESERVED' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                        'bg-stone-100 text-stone-700 border-stone-300'
                      }`}
                    >
                      <option value="AVAILABLE">AVAILABLE (Trống)</option>
                      <option value="OCCUPIED">OCCUPIED (Đang có khách)</option>
                      <option value="RESERVED">RESERVED (Đã đặt trước)</option>
                      <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(t)}
                        className="p-2 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id, t.table_number)}
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
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              {editingTable ? 'Chỉnh Sửa Thông Tin Bàn' : 'Thêm Bàn Mới'}
            </h3>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Số hiệu bàn (Mã bàn) *</label>
                <input
                  type="text"
                  required
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  placeholder="Ví dụ: T11, VIP1"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Sức chứa tối đa (Chỗ ngồi) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Khu vực *</label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                >
                  <option value="INDOOR">INDOOR (Trong nhà)</option>
                  <option value="OUTDOOR">OUTDOOR (Sân vườn)</option>
                  <option value="ROOFTOP">ROOFTOP (Tầng thượng)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Trạng thái bàn</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                >
                  <option value="AVAILABLE">AVAILABLE (Sẵn sàng)</option>
                  <option value="OCCUPIED">OCCUPIED (Đang có khách)</option>
                  <option value="RESERVED">RESERVED (Đã đặt trước)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
                </select>
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
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
