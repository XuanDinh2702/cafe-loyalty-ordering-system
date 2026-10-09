import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Coffee,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  QrCode,
  Banknote,
  Check,
  AlertCircle,
  Tag,
  Users,
  Award,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { api, formatVND, getTierBadge } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReceiptModal from '../../components/ReceiptModal';

export default function POSPage() {
  const { user } = useAuth();

  // Menu items & tables
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchItem, setSearchItem] = useState('');

  // Cart & Order Options
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('DINE_IN'); // 'DINE_IN' | 'TAKEAWAY'
  const [selectedTableId, setSelectedTableId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH' | 'TRANSFER' | 'CARD'

  // Customer Loyalty Lookup
  const [phoneLookup, setPhoneLookup] = useState('');
  const [customer, setCustomer] = useState(null);
  const [availableCustomerVouchers, setAvailableCustomerVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');

  // Quick Customer Create Modal
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);

  // Checkout State & Receipt
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [completedOrderItems, setCompletedOrderItems] = useState([]);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    loadPOSData();
  }, []);

  const loadPOSData = async () => {
    try {
      const [cats, items, tbls] = await Promise.all([
        api.getCategories(),
        api.getMenuItems('?availableOnly=true'),
        api.getTables()
      ]);
      setCategories(cats.categories || []);
      setMenuItems(items.items || []);
      setTables(tbls.tables || []);
    } catch (e) {
      console.error('POS load error:', e);
    }
  };

  // Add item to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menu_item_id === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item_id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item._id,
          item_name: item.name,
          unit_price: item.price,
          quantity: 1,
          note: ''
        }
      ];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.menu_item_id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const updateItemNote = (itemId, note) => {
    setCart((prev) =>
      prev.map((i) => (i.menu_item_id === itemId ? { ...i, note } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedVoucherId('');
    setCheckoutError('');
  };

  // Customer Lookup
  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!phoneLookup.trim()) return;

    setLookupLoading(true);
    setLookupMessage('');
    try {
      const res = await api.lookupCustomer(phoneLookup.trim());
      setCustomer(res.customer);
      setAvailableCustomerVouchers(res.availableVouchers || []);
      setSelectedVoucherId('');
    } catch (err) {
      setCustomer(null);
      setAvailableCustomerVouchers([]);
      setLookupMessage(err.message || 'Không tìm thấy số điện thoại');
    } finally {
      setLookupLoading(false);
    }
  };

  // Quick Create Customer
  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!newCustPhone || !newCustName) return;

    setQuickCreateLoading(true);
    try {
      const res = await api.quickCreateCustomer({
        phone: newCustPhone.trim(),
        full_name: newCustName.trim()
      });
      setCustomer(res.customer);
      setAvailableCustomerVouchers([]);
      setPhoneLookup(res.customer.phone);
      setShowQuickCreate(false);
      setNewCustPhone('');
      setNewCustName('');
      setLookupMessage('');
    } catch (err) {
      alert(err.message || 'Lỗi tạo khách hàng');
    } finally {
      setQuickCreateLoading(false);
    }
  };

  // Subtotal Calculation
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  // Discount Calculation based on selected voucher
  let discountAmount = 0;
  const appliedVoucherObj = availableCustomerVouchers.find((v) => v._id === selectedVoucherId);

  if (appliedVoucherObj && appliedVoucherObj.voucher_id) {
    const v = appliedVoucherObj.voucher_id;
    if (v.discount_type === 'PERCENTAGE') {
      let calc = (subtotal * v.discount_value) / 100;
      if (v.max_discount_amount && calc > v.max_discount_amount) {
        calc = v.max_discount_amount;
      }
      discountAmount = Math.round(calc);
    } else {
      discountAmount = Math.min(subtotal, v.discount_value);
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Points that will be earned: 10,000 VND = 1 point
  const pointsToEarn = customer ? Math.floor(totalAmount / 10000) : 0;

  // Checkout handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutError('Giỏ hàng chưa có món nào');
      return;
    }

    if (orderType === 'DINE_IN' && !selectedTableId) {
      setCheckoutError('Vui lòng chọn bàn phục vụ cho đơn tại quán');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const payload = {
        customer_id: customer?._id || null,
        table_id: orderType === 'DINE_IN' ? selectedTableId : null,
        order_type: orderType,
        items: cart,
        customer_voucher_id: selectedVoucherId || null,
        payment_method: paymentMethod
      };

      const res = await api.createOrder(payload);
      setCompletedOrder(res.order);
      setCompletedOrderItems(res.items);

      // Reset cart
      setCart([]);
      setSelectedVoucherId('');
      // Update customer state if points earned
      if (res.customer) {
        setCustomer(res.customer);
      }
      // Reload tables to reflect occupancy
      loadPOSData();
    } catch (err) {
      setCheckoutError(err.message || 'Lỗi khi thanh toán đơn hàng');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredItems = menuItems.filter((i) => {
    const matchCat = selectedCategory === 'all' || i.category_id?._id === selectedCategory;
    const matchSearch = i.name.toLowerCase().includes(searchItem.toLowerCase());
    return matchCat && matchSearch;
  });

  const tierBadge = customer?.membership_tier ? getTierBadge(customer.membership_tier) : null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f4eee6] p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Menu catalog & Quick Selection (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Categories Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  placeholder="Tìm nhanh đồ uống, bánh ngọt..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
              <div className="text-xs font-semibold text-stone-500 whitespace-nowrap">
                {filteredItems.length} món sẵn sàng
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Tất cả
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedCategory(c._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === c._id
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs hover:border-amber-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between group active:scale-95"
              >
                <div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-stone-100 mb-2">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1 group-hover:text-amber-800">
                    {item.name}
                  </h4>
                </div>
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-black text-xs sm:text-sm text-amber-900 font-sans">
                    {formatVND(item.price)}
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-amber-100 group-hover:bg-amber-800 group-hover:text-white text-amber-900 flex items-center justify-center transition">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Cart, Customer Loyalty & POS Billing (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-5">
          {/* Customer Lookup & Loyalty Card */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-700" /> Tích Điểm Hội Viên
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewCustPhone(phoneLookup);
                  setShowQuickCreate(true);
                }}
                className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Tạo khách mới
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                type="tel"
                value={phoneLookup}
                onChange={(e) => setPhoneLookup(e.target.value)}
                placeholder="Nhập số điện thoại khách hàng..."
                className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {lookupLoading ? '...' : 'Tìm'}
              </button>
            </form>

            {lookupMessage && (
              <p className="text-[11px] text-amber-700 font-medium">{lookupMessage}</p>
            )}

            {/* Found Customer Details */}
            {customer && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900 block">{customer.full_name}</span>
                    <span className="text-stone-500 text-[11px] font-mono">{customer.phone}</span>
                  </div>
                  {tierBadge && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${tierBadge.color}`}>
                      {customer.membership_tier}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px]">
                  <span>Điểm hiện có: <strong className="text-amber-900 text-xs">{customer.current_points} điểm</strong></span>
                  <button
                    onClick={() => {
                      setCustomer(null);
                      setAvailableCustomerVouchers([]);
                      setSelectedVoucherId('');
                      setPhoneLookup('');
                    }}
                    className="text-stone-400 hover:text-stone-700 underline text-[10px]"
                  >
                    Bỏ chọn
                  </button>
                </div>

                {/* Available customer vouchers selector */}
                {availableCustomerVouchers.length > 0 && (
                  <div className="pt-2 border-t border-amber-200/60">
                    <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-amber-600" /> Chọn Voucher của khách ({availableCustomerVouchers.length}):
                    </label>
                    <select
                      value={selectedVoucherId}
                      onChange={(e) => setSelectedVoucherId(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-700"
                    >
                      <option value="">-- Không áp dụng voucher --</option>
                      {availableCustomerVouchers.map((cv) => (
                        <option key={cv._id} value={cv._id}>
                          {cv.voucher_id?.code} - {cv.voucher_id?.title} ({cv.voucher_id?.discount_type === 'PERCENTAGE' ? `Giảm ${cv.voucher_id.discount_value}%` : `Giảm ${formatVND(cv.voucher_id.discount_value)}`})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dine-in vs Takeaway and Table Selection */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOrderType('DINE_IN')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  orderType === 'DINE_IN'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" /> Dùng Tại Quán
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderType('TAKEAWAY');
                  setSelectedTableId('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  orderType === 'TAKEAWAY'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Mang Đi (Takeaway)
              </button>
            </div>

            {orderType === 'DINE_IN' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-600 whitespace-nowrap">Chọn bàn:</span>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-700"
                >
                  <option value="">-- Bấm chọn số bàn --</option>
                  {tables.map((t) => (
                    <option key={t._id} value={t._id}>
                      Bàn {t.table_number} ({t.capacity} chỗ - {t.area}) [{t.status}]
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
              <span>Món gọi ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:underline flex items-center gap-1 font-normal text-[11px]"
                >
                  <Trash2 className="w-3 h-3" /> Xóa tất cả
                </button>
              )}
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-stone-100 p-2">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  Chưa chọn món nào. Hãy click món bên trái để thêm.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.menu_item_id} className="py-2 px-1 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{item.item_name}</span>
                      <span className="font-bold text-amber-900">
                        {formatVND(item.unit_price * item.quantity)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Note input */}
                      <input
                        type="text"
                        placeholder="Ghi chú pha chế..."
                        value={item.note}
                        onChange={(e) => updateItemNote(item.menu_item_id, e.target.value)}
                        className="text-[11px] px-2 py-0.5 bg-stone-50 border border-stone-200 rounded-md w-36 focus:bg-white"
                      />

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, -1)}
                          className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, 1)}
                          className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pricing & Points Summary */}
          <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Tổng tiền hàng:</span>
              <span className="font-semibold">{formatVND(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Voucher giảm giá:</span>
                <span>-{formatVND(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1 border-t">
              <span>Khách cần trả:</span>
              <span className="text-amber-900 text-lg">{formatVND(totalAmount)}</span>
            </div>

            {customer && (
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-900 font-medium flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Award className="w-4 h-4 text-amber-600" /> Tích lũy đơn này:
                </span>
                <span className="text-emerald-700 font-bold text-xs">+{pointsToEarn} điểm</span>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <span className="block text-xs font-bold text-stone-700 mb-1.5">Phương thức thanh toán:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  paymentMethod === 'CASH'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" /> Tiền mặt
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> VietQR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  paymentMethod === 'CARD'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Thẻ Pos
              </button>
            </div>
          </div>

          {checkoutError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkoutLoading || cart.length === 0}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-2xl text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {checkoutLoading ? 'Đang xuất hóa đơn...' : `Thanh Toán & In Hóa Đơn (${formatVND(totalAmount)})`}
          </button>
        </div>
      </div>

      {/* Quick Create Customer Modal */}
      {showQuickCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-700" /> Tạo Khách Hàng Nhanh
            </h3>
            <p className="text-xs text-stone-500">
              Tạo hồ sơ nhanh tại quầy để khách nhận điểm tích lũy ngay cho đơn hàng hiện tại.
            </p>

            <form onSubmit={handleQuickCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="09..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickCreate(false)}
                  className="flex-1 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 font-semibold rounded-xl text-xs transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={quickCreateLoading}
                  className="flex-1 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs transition"
                >
                  {quickCreateLoading ? 'Đang tạo...' : 'Lưu & Chọn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thermal Receipt Modal */}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          items={completedOrderItems}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </div>
  );
}
