import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, ArrowLeft, Coffee, Sparkles } from 'lucide-react';
import { api, formatVND } from '../../services/api';

export default function MenuManagePage({ onBack }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    image_url: '',
    description: '',
    is_available: true
  });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, itemRes] = await Promise.all([
        api.getCategories(),
        api.getMenuItems()
      ]);
      setCategories(catRes.categories || []);
      setItems(itemRes.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category_id: item.category_id?._id || item.category_id || '',
        price: item.price,
        image_url: item.image_url || '',
        description: item.description || '',
        is_available: item.is_available
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category_id: categories[0]?._id || '',
        price: '',
        image_url: '',
        description: '',
        is_available: true
      });
    }
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem._id, formData);
      } else {
        await api.createMenuItem(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setSubmitError(err.message || 'Lỗi khi lưu thông tin món');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa món "${name}" khỏi thực đơn?`)) return;
    try {
      await api.deleteMenuItem(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa món');
    }
  };

  const handleToggleAvailable = async (item) => {
    try {
      await api.updateMenuItem(item._id, { is_available: !item.is_available });
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi đổi trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
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
              Quản Lý Thực Đơn & Giá Bán
            </h1>
            <p className="text-xs text-stone-500">Cập nhật danh mục, hình ảnh, đơn giá và trạng thái còn món</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Thêm Món Mới
        </button>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Hình ảnh</th>
                <th className="py-3.5 px-4">Tên món</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">Giá bán</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-stone-900 text-sm">{item.name}</p>
                    <p className="text-[11px] text-stone-400 line-clamp-1">{item.description}</p>
                  </td>
                  <td className="py-3 px-4 text-stone-600 font-medium">
                    {item.category_id?.name || 'Chưa phân loại'}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-900 text-sm">
                    {formatVND(item.price)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAvailable(item)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition ${
                        item.is_available
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {item.is_available ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {item.is_available ? 'Đang phục vụ' : 'Hết hàng'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              {editingItem ? 'Chỉnh Sửa Món Ăn / Thức Uống' : 'Thêm Món Mới Vào Menu'}
            </h3>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tên món *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Cà Phê Trứng Hà Nội"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Danh mục *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="35000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Đường dẫn hình ảnh (URL)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mô tả thành phần</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả hương vị, nguyên liệu..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="avail_check"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="rounded text-amber-800 focus:ring-amber-700"
                />
                <label htmlFor="avail_check" className="text-xs font-semibold text-stone-700">
                  Đang sẵn sàng phục vụ (Còn hàng)
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 font-semibold rounded-xl text-xs"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
