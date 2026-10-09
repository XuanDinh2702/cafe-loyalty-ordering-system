import React, { useState, useEffect } from 'react';
import { Plus, Key, ArrowLeft, Users, ShieldCheck, Check, X } from 'lucide-react';
import { api, formatDateTime } from '../../services/api';

export default function StaffManagePage({ onBack }) {
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'STAFF',
    phone: ''
  });

  // Password reset modal
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const res = await api.getStaffList();
      setStaffList(res.staff || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitError('');

    try {
      await api.createStaff(formData);
      setIsModalOpen(false);
      setFormData({ username: '', password: '', full_name: '', role: 'STAFF', phone: '' });
      loadStaff();
    } catch (err) {
      setSubmitError(err.message || 'Lỗi khi tạo nhân viên');
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.updateStaffStatus(user._id, nextStatus);
      loadStaff();
    } catch (err) {
      alert(err.message || 'Lỗi đổi trạng thái');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;

    try {
      await api.resetStaffPassword(resetModalUser._id, newPassword);
      alert('Đã đổi mật khẩu thành công!');
      setResetModalUser(null);
      setNewPassword('');
    } catch (err) {
      alert(err.message || 'Lỗi đặt lại mật khẩu');
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
              Quản Trị Nhân Sự & Phân Quyền Hệ Thống
            </h1>
            <p className="text-xs text-stone-500">Cấp tài khoản thu ngân, phân quyền Quản trị viên và khóa tài khoản khi cần</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Cấp Tài Khoản Mới
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tên đăng nhập</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Quyền hạn (Role)</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staffList.map((u) => (
                <tr key={u._id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-stone-900">
                    {u.username}
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                    {u.full_name}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {u.role === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Thu ngân (Staff)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-600">
                    {u.phone || 'Chưa cập nhật'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {u.status === 'ACTIVE' ? 'Hoạt động (Active)' : 'Đã khóa (Inactive)'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-stone-400 text-[11px]">
                    {formatDateTime(u.created_at)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setResetModalUser(u)}
                      className="px-3 py-1 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                    >
                      <Key className="w-3 h-3" /> Đổi mật khẩu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">Cấp Tài Khoản Nhân Viên Mới</h3>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {submitError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tên đăng nhập *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="cashier2"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mật khẩu ban đầu *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Họ và tên nhân viên *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nguyễn Văn B"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Quyền hạn (Vai trò) *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                >
                  <option value="STAFF">Thu ngân (STAFF)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Số điện thoại liên lạc</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
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
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              Đặt Lại Mật Khẩu Cho {resetModalUser.full_name}
            </h3>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="flex-1 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 font-semibold rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
