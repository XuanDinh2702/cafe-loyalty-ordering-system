import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Sparkles, MapPin, Coffee } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function BookingPage() {
  const { user, role } = useAuth();
  const [tables, setTables] = useState([]);
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedTable, setSelectedTable] = useState(null);

  // Form fields
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [guestCount, setGuestCount] = useState(2);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');

  // Status & checks
  const [availabilityMessage, setAvailabilityMessage] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successReservation, setSuccessReservation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (user && role === 'CUSTOMER') {
      if (!fullName) setFullName(user.full_name);
      if (!phone) setPhone(user.phone);
    }
  }, [user, role]);

  const loadTables = async () => {
    try {
      const res = await api.getTables();
      setTables(res.tables || []);
    } catch (e) {
      console.error('Error loading tables:', e);
    }
  };

  // Run availability check when table or time changes
  useEffect(() => {
    if (!selectedTable || !bookingDate || !startTime || !endTime) return;

    const startISO = new Date(`${bookingDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${bookingDate}T${endTime}:00`).toISOString();

    if (new Date(startISO) >= new Date(endISO)) {
      setAvailabilityMessage({ isAvailable: false, message: 'Giờ bắt đầu phải trước giờ kết thúc' });
      return;
    }

    const check = async () => {
      try {
        setCheckingAvailability(true);
        const res = await api.checkAvailability(selectedTable._id, startISO, endISO);
        setAvailabilityMessage(res);
      } catch (err) {
        setAvailabilityMessage({ isAvailable: false, message: err.message });
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timer = setTimeout(check, 300);
    return () => clearTimeout(timer);
  }, [selectedTable, bookingDate, startTime, endTime]);

  const handleBookTable = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedTable) {
      setErrorMessage('Vui lòng chọn 1 bàn ăn trước khi đặt');
      return;
    }

    if (availabilityMessage && !availabilityMessage.isAvailable) {
      setErrorMessage(availabilityMessage.message || 'Khung giờ này bàn đã có khách đặt');
      return;
    }

    const startISO = new Date(`${bookingDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${bookingDate}T${endTime}:00`).toISOString();

    try {
      setSubmitting(true);
      const res = await api.createReservation({
        table_id: selectedTable._id,
        customer_id: role === 'CUSTOMER' ? user._id : undefined,
        phone,
        full_name: fullName,
        start_time: startISO,
        end_time: endISO,
        guest_count: Number(guestCount),
        note
      });

      setSuccessReservation(res.reservation);
    } catch (err) {
      setErrorMessage(err.message || 'Đặt bàn thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTables = tables.filter(
    (t) => selectedArea === 'all' || t.area === selectedArea
  );

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Dịch Vụ Đặt Chỗ Trực Tuyến
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-sans">
            Đặt Bàn Trước Tại README Cafe
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm max-w-xl mx-auto">
            Lựa chọn vị trí bàn yêu thích trong nhà, sân vườn ngoài trời hoặc ban công tầng thượng lộng gió. Hệ thống tự động kiểm tra chống trùng lịch 100%.
          </p>
        </div>

        {/* Success Modal */}
        {successReservation && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-emerald-900 shadow-md animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold">Xác Nhận Đặt Bàn Thành Công!</h3>
                <p className="text-sm text-emerald-800">
                  Cảm ơn Quý khách <span className="font-bold">{successReservation.customer_id?.full_name}</span>. Bàn số <span className="font-bold">{successReservation.table_id?.table_number}</span> đã được giữ riêng cho bạn vào khung giờ <span className="font-bold">{startTime} - {endTime} ngày {bookingDate}</span>.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 bg-white border border-emerald-300 rounded-lg font-semibold">
                    Khu vực: {successReservation.table_id?.area}
                  </span>
                  <span className="px-3 py-1 bg-white border border-emerald-300 rounded-lg font-semibold">
                    Số khách: {successReservation.guest_count} người
                  </span>
                  <span className="px-3 py-1 bg-white border border-emerald-300 rounded-lg font-semibold">
                    Trạng thái: Đã xác nhận (CONFIRMED)
                  </span>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSuccessReservation(null);
                      setSelectedTable(null);
                    }}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition"
                  >
                    Đặt Thêm Lịch Mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Left = Floor Plan, Right = Booking Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Floor Plan & Table Selection */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-700" /> Sơ Đồ Không Gian Bàn
                </h2>
                <p className="text-xs text-stone-500">Bấm chọn bàn phù hợp với số lượng người</p>
              </div>

              {/* Area Tabs */}
              <div className="flex gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                {['all', 'INDOOR', 'OUTDOOR', 'ROOFTOP'].map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      selectedArea === area
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {area === 'all' && 'Tất cả'}
                    {area === 'INDOOR' && 'Trong nhà'}
                    {area === 'OUTDOOR' && 'Sân vườn'}
                    {area === 'ROOFTOP' && 'Tầng thượng'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredTables.map((t) => {
                const isSelected = selectedTable?._id === t._id;
                return (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTable(t)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative ${
                      isSelected
                        ? 'border-amber-700 bg-amber-50/70 shadow-md ring-2 ring-amber-700/20'
                        : 'border-stone-200 hover:border-amber-400 bg-stone-50/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-lg text-stone-900">
                        {t.table_number}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        t.status === 'AVAILABLE' ? 'bg-emerald-500' :
                        t.status === 'OCCUPIED' ? 'bg-red-500' :
                        t.status === 'RESERVED' ? 'bg-amber-500' : 'bg-stone-400'
                      }`} />
                    </div>

                    <div className="space-y-1 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <span>Sức chứa: {t.capacity} người</span>
                      </div>
                      <div className="text-[11px] text-stone-400 uppercase font-semibold">
                        {t.area === 'INDOOR' && 'Phòng Lạnh'}
                        {t.area === 'OUTDOOR' && 'Ngoài Trời'}
                        {t.area === 'ROOFTOP' && 'Ban Công Gió'}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 py-1 text-center bg-amber-700 text-white text-[11px] font-bold rounded-lg uppercase">
                        Đang chọn
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Note legend */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-around text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bàn sẵn sàng
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Đã có lịch đặt
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Đang phục vụ
              </span>
            </div>
          </div>

          {/* Right Column: Reservation Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200">
            <h2 className="font-bold text-lg text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-700" /> Thông Tin Lịch Đặt
            </h2>

            {selectedTable ? (
              <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-amber-800 font-semibold block">Bàn đã chọn:</span>
                  <span className="font-extrabold text-stone-900 text-sm">
                    {selectedTable.table_number} ({selectedTable.capacity} chỗ - {selectedTable.area})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTable(null)}
                  className="text-stone-400 hover:text-stone-700 underline text-[11px]"
                >
                  Đổi bàn
                </button>
              </div>
            ) : (
              <div className="mb-5 p-3.5 bg-stone-100 border border-stone-200 rounded-2xl text-xs text-stone-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Vui lòng chọn 1 bàn ở danh sách bên trái trước.</span>
              </div>
            )}

            <form onSubmit={handleBookTable} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ngày nhận bàn</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                  />
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Giờ bắt đầu</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-9 pr-2 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Giờ kết thúc</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-9 pr-2 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Availability conflict notice */}
              {selectedTable && availabilityMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  availabilityMessage.isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {availabilityMessage.isAvailable ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{checkingAvailability ? 'Đang kiểm tra lịch...' : availabilityMessage.message}</span>
                </div>
              )}

              {/* Guest Count */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Số lượng khách dự kiến</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min="1"
                    max={selectedTable ? selectedTable.capacity + 2 : 20}
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Họ tên</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    placeholder="0987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Yêu cầu riêng (Ghi chú)</label>
                <textarea
                  rows="2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Chuẩn bị ghế trẻ em, bàn họp việc nhẹ nhàng..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || (availabilityMessage && !availabilityMessage.isAvailable)}
                className="w-full py-3.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Đang gửi phiếu đặt...' : 'Xác Nhận Đặt Bàn Ngay'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
