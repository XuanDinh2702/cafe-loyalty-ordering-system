import React, { useState, useEffect } from 'react';
import {
  Search,
  Coffee,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Tag,
  Phone,
  Check,
  RotateCw,
  Utensils
} from 'lucide-react';
import { api, formatVND } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MenuPage() {
  const { user, role } = useAuth();

  // Menu data
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Table selection
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableModalOpen, setTableModalOpen] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Loyalty & Vouchers for customer
  const [customerVouchers, setCustomerVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Order tracking modal
  const [activeTrackedOrder, setActiveTrackedOrder] = useState(null);
  const [orderTrackingModalOpen, setOrderTrackingModalOpen] = useState(false);

  // Temporary feedback toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Load menu, tables and customer vouchers
  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch vouchers when customer is logged in
  useEffect(() => {
    if (role === 'CUSTOMER' && user?._id) {
      loadCustomerVouchers(user._id);
    }
  }, [role, user]);

  // Read URL query param ?table=T01 or read from localStorage
  useEffect(() => {
    if (tables.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTable = urlParams.get('table') || urlParams.get('ban');

      if (urlTable) {
        const found = tables.find(
          (t) => t.table_number.toLowerCase() === urlTable.toLowerCase()
        );
        if (found) {
          setSelectedTable(found);
          localStorage.setItem('cafe_active_table', JSON.stringify(found));
          return;
        }
      }

      // Check localStorage
      const savedTable = localStorage.getItem('cafe_active_table');
      if (savedTable) {
        try {
          const parsed = JSON.parse(savedTable);
          const stillExists = tables.find((t) => t._id === parsed._id);
          if (stillExists) {
            setSelectedTable(stillExists);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [tables]);

  // Auto-poll tracked order status
  useEffect(() => {
    if (!orderTrackingModalOpen || !activeTrackedOrder?.order_code) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.trackOrder(activeTrackedOrder.order_code);
        if (res.order) {
          setActiveTrackedOrder(res.order);
        }
      } catch (e) {
        console.error('Error polling order status:', e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [orderTrackingModalOpen, activeTrackedOrder?.order_code]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [catsRes, itemsRes, tablesRes] = await Promise.all([
        api.getCategories(),
        api.getMenuItems(),
        api.getTables()
      ]);
      setCategories(catsRes.categories || []);
      setItems(itemsRes.items || []);
      setTables(tablesRes.tables || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerVouchers = async (customerId) => {
    try {
      const res = await api.getCustomerVouchers(customerId);
      const available = (res.vouchers || []).filter((v) => v.status === 'AVAILABLE');
      setCustomerVouchers(available);
    } catch (e) {
      console.error('Error loading vouchers:', e);
    }
  };

  const handleSelectTable = (tbl) => {
    setSelectedTable(tbl);
    localStorage.setItem('cafe_active_table', JSON.stringify(tbl));
    setTableModalOpen(false);
    showToast(`Đã chọn Bàn ${tbl.table_number}`);
  };

  // Cart operations
  const handleAddToCart = (menuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === menuItem._id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item_id === menuItem._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          menu_item_id: menuItem._id,
          item_name: menuItem.name,
          price: menuItem.price,
          image_url: menuItem.image_url,
          quantity: 1,
          note: ''
        }
      ];
    });
    showToast(`Đã thêm ${menuItem.name}`);
  };

  const updateItemQty = (itemId, delta) => {
    setCartItems((prev) =>
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
    setCartItems((prev) =>
      prev.map((i) => (i.menu_item_id === itemId ? { ...i, note } : i))
    );
  };

  const removeItem = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i.menu_item_id !== itemId));
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Voucher discount
  let discountAmount = 0;
  const appliedVoucherObj = customerVouchers.find((v) => v._id === selectedVoucherId);
  if (appliedVoucherObj && appliedVoucherObj.voucher_id) {
    const v = appliedVoucherObj.voucher_id;
    if (!v.min_order_value || subtotal >= v.min_order_value) {
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
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);
  const estimatedPoints = Math.floor(finalTotal / 10000);

  // Submit table order
  const handleSubmitOrder = async () => {
    if (!selectedTable) {
      setTableModalOpen(true);
      return;
    }
    if (cartItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 món vào giỏ hàng');
      return;
    }

    try {
      setSubmittingOrder(true);
      const payload = {
        table_id: selectedTable._id,
        table_number: selectedTable.table_number,
        customer_id: role === 'CUSTOMER' && user?._id ? user._id : undefined,
        customer_phone: guestPhone.trim() || undefined,
        customer_voucher_id: selectedVoucherId || undefined,
        items: cartItems.map((it) => ({
          menu_item_id: it.menu_item_id,
          quantity: it.quantity,
          note: it.note
        })),
        notes: orderNotes.trim()
      };

      const res = await api.createTableOrder(payload);

      // Reset cart
      setCartItems([]);
      setOrderNotes('');
      setSelectedVoucherId('');
      setCartDrawerOpen(false);

      // Open tracking modal
      setActiveTrackedOrder(res.order);
      setOrderTrackingModalOpen(true);
    } catch (err) {
      alert(err.message || 'Lỗi gửi đơn đặt món');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' ||
      item.category_id?._id === selectedCategory ||
      item.category_id === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 pb-28 font-sans selection:bg-amber-800 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-stone-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-lg border border-white/10 flex items-center gap-2 animate-bounce">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero / Top Section */}
      <section className="bg-gradient-to-b from-stone-900 to-stone-850 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-6xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thực Đơn Tinh Tế & Gọi Món Tại Bàn</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            README ARTISAN COFFEE
          </h1>

          <p className="max-w-xl mx-auto text-stone-300 text-xs sm:text-sm font-normal leading-relaxed">
            Hương vị cà phê nguyên bản, trà hoa thanh mát và bánh nướng tươi mỗi ngày.
            Chọn món ngay trên điện thoại, nhân viên phục vụ tận bàn của bạn.
          </p>

          {/* Table Indicator Pill in Hero */}
          <div className="pt-2 flex justify-center">
            {selectedTable ? (
              <div className="inline-flex items-center gap-3 bg-stone-800/80 backdrop-blur-md border border-amber-500/40 px-4 py-2 rounded-2xl text-xs shadow-md">
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Đang ngồi tại Bàn {selectedTable.table_number}
                </span>
                <span className="text-stone-400">|</span>
                <span className="text-stone-300">
                  {selectedTable.area === 'INDOOR'
                    ? 'Khu Trong Nhà'
                    : selectedTable.area === 'OUTDOOR'
                    ? 'Sân Vườn'
                    : 'Ban Công'}
                </span>
                <button
                  onClick={() => setTableModalOpen(true)}
                  className="ml-1 text-[11px] underline text-amber-200 hover:text-white font-semibold transition"
                >
                  Đổi bàn
                </button>
              </div>
            ) : (
              <button
                onClick={() => setTableModalOpen(true)}
                className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-2xl text-xs transition shadow-md"
              >
                <MapPin className="w-4 h-4" />
                <span>Bạn đang ngồi bàn số mấy? Chọn bàn ngay</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Categories Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-stone-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm món, hương vị, nguyên liệu..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Total items count */}
            <div className="text-xs text-stone-500 font-medium self-end sm:self-center">
              Hiện có <strong className="text-stone-800">{filteredItems.length}</strong> món
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
              }`}
            >
              Tất cả món ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat._id
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <main className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl h-80 animate-pulse border border-stone-200/70"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 space-y-3">
              <Coffee className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-800 text-base">Không tìm thấy món phù hợp</h3>
              <p className="text-xs text-stone-500">
                Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục khác.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredItems.map((item) => {
                const cartEntry = cartItems.find((ci) => ci.menu_item_id === item._id);
                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200/70 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
                  >
                    {/* Item Image */}
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={
                          item.image_url ||
                          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
                        }
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3 py-1 bg-red-600 text-white text-[11px] font-bold rounded-xl uppercase tracking-wider">
                            Tạm hết món
                          </span>
                        </div>
                      )}
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-stone-900/75 backdrop-blur-sm text-stone-100 text-[10px] font-bold rounded-xl uppercase tracking-wider">
                        {item.category_id?.name?.split(' ')[0] || 'Món'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-amber-800 transition">
                          {item.name}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                          {item.description || 'Thức uống được pha chế tỉ mỉ từ nguyên liệu hảo hạng.'}
                        </p>
                      </div>

                      {/* Price & Action */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-stone-400 block leading-tight">Đơn giá</span>
                          <span className="font-black text-amber-950 text-sm sm:text-base">
                            {formatVND(item.price)}
                          </span>
                        </div>

                        {item.is_available && (
                          <div className="flex items-center gap-1.5">
                            {cartEntry ? (
                              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-2xl p-1">
                                <button
                                  onClick={() => updateItemQty(item._id, -1)}
                                  className="w-6 h-6 rounded-xl bg-white text-stone-700 flex items-center justify-center hover:bg-stone-100 text-xs font-bold transition shadow-2xs"
                                >
                                  -
                                </button>
                                <span className="font-extrabold text-amber-900 text-xs px-1">
                                  {cartEntry.quantity}
                                </span>
                                <button
                                  onClick={() => updateItemQty(item._id, 1)}
                                  className="w-6 h-6 rounded-xl bg-amber-800 text-white flex items-center justify-center hover:bg-amber-900 text-xs font-bold transition shadow-2xs"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="px-3 py-1.5 rounded-2xl bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Thêm</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-5 inset-x-0 z-40 px-4 max-w-xl mx-auto">
          <div className="bg-stone-900/95 backdrop-blur-md text-white rounded-3xl p-3.5 shadow-2xl border border-stone-700 flex items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-700 flex items-center justify-center text-white relative flex-shrink-0 shadow-md">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900">
                  {totalItemCount}
                </span>
              </div>
              <div className="text-left">
                <div className="text-[11px] text-stone-300 font-medium">
                  {selectedTable ? `Bàn ${selectedTable.table_number}` : 'Chưa chọn bàn'} •{' '}
                  {totalItemCount} món
                </div>
                <div className="font-black text-amber-300 text-sm sm:text-base leading-tight">
                  {formatVND(subtotal)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setCartDrawerOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm whitespace-nowrap"
            >
              <span>Xem giỏ & Gọi món</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="font-black text-stone-900 text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-800" />
                  Đơn Gọi Món Tại Bàn
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Đơn sẽ được chuyển ngay đến quầy Barista
                </p>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Table Info Banner in Cart */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-800" />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      {selectedTable
                        ? `Bàn ${selectedTable.table_number} (${selectedTable.area === 'INDOOR' ? 'Trong nhà' : 'Sân vườn'})`
                        : 'Chưa chọn số bàn'}
                    </span>
                    <span className="text-[11px] text-amber-800">
                      {selectedTable ? 'Phục vụ tận chỗ' : 'Vui lòng chọn bàn để gửi đơn'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setTableModalOpen(true)}
                  className="px-2.5 py-1 bg-white border border-amber-300 rounded-xl text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
                >
                  {selectedTable ? 'Đổi bàn' : 'Chọn bàn'}
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Món đã chọn ({totalItemCount})
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.menu_item_id}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                          {item.item_name}
                        </h4>
                        <span className="text-xs font-bold text-amber-900 font-mono">
                          {formatVND(item.price)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-stone-200 rounded-xl p-0.5">
                          <button
                            onClick={() => updateItemQty(item.menu_item_id, -1)}
                            className="w-6 h-6 rounded-lg text-stone-700 flex items-center justify-center hover:bg-stone-100 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-xs px-2 text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQty(item.menu_item_id, 1)}
                            className="w-6 h-6 rounded-lg text-stone-700 flex items-center justify-center hover:bg-stone-100 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.menu_item_id)}
                          className="text-stone-400 hover:text-red-600 p-1 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Note input for customization */}
                    <input
                      type="text"
                      placeholder="Ghi chú (ví dụ: ít đá, 70% đường, nóng...)"
                      value={item.note || ''}
                      onChange={(e) => updateItemNote(item.menu_item_id, e.target.value)}
                      className="w-full text-[11px] bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                  </div>
                ))}
              </div>

              {/* Loyalty & Guest phone */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Tích điểm & Ưu đãi
                </div>

                {role === 'CUSTOMER' && user ? (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">Hội viên:</span>
                      <strong className="text-stone-900">{user.full_name}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">Điểm hiện có:</span>
                      <strong className="text-amber-800">{user.current_points || 0} điểm</strong>
                    </div>

                    {/* Voucher selection */}
                    {customerVouchers.length > 0 && (
                      <div className="pt-2 border-t border-stone-200/60">
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                          Áp dụng voucher của bạn:
                        </label>
                        <select
                          value={selectedVoucherId}
                          onChange={(e) => setSelectedVoucherId(e.target.value)}
                          className="w-full text-xs bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-700"
                        >
                          <option value="">-- Không áp dụng voucher --</option>
                          {customerVouchers.map((cv) => (
                            <option key={cv._id} value={cv._id}>
                              {cv.voucher_id?.title} (-
                              {cv.voucher_id?.discount_type === 'PERCENTAGE'
                                ? `${cv.voucher_id.discount_value}%`
                                : formatVND(cv.voucher_id?.discount_value)}
                              )
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5">
                    <label className="text-xs text-stone-600 block font-medium">
                      Nhập số điện thoại để tích điểm (không bắt buộc):
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Ví dụ: 0912345678"
                        className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-700"
                      />
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Mỗi 10.000 ₫ chi tiêu = 1 điểm thưởng hội viên.
                    </p>
                  </div>
                )}
              </div>

              {/* Order note */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-600 block">
                  Lời nhắn cho quán (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Giao kèm ly đá thêm, chuẩn bị trước mang về..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-700 resize-none"
                />
              </div>

              {/* Bill breakdown */}
              <div className="pt-2 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Tạm tính ({totalItemCount} món):</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Giảm giá voucher:</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-stone-100">
                  <span>Tổng thanh toán:</span>
                  <span className="text-amber-950 font-mono text-base">{formatVND(finalTotal)}</span>
                </div>
                {estimatedPoints > 0 && (
                  <div className="flex justify-between text-[11px] text-amber-800 font-semibold">
                    <span>Điểm tích lũy dự kiến:</span>
                    <span>+{estimatedPoints} điểm</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/50">
              <button
                disabled={submittingOrder || cartItems.length === 0}
                onClick={handleSubmitOrder}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-900 hover:bg-amber-800 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                {submittingOrder ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Đang gửi đơn đến quầy Barista...</span>
                  </>
                ) : (
                  <>
                    <Utensils className="w-4 h-4" />
                    <span>Gửi Đơn Đến Quầy Pha Chế ({formatVND(finalTotal)})</span>
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-stone-400 mt-2">
                Quý khách có thể thanh toán tại bàn khi nhân viên giao đồ uống.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table Selector Modal */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg">Chọn Bàn Ngồi Của Bạn</h3>
                <p className="text-xs text-stone-500">
                  Chọn đúng số bàn trên mặt bàn của bạn để nhân viên phục vụ tận nơi
                </p>
              </div>
              <button
                onClick={() => setTableModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {tables.map((tbl) => {
                const isSelected = selectedTable?._id === tbl._id;
                return (
                  <button
                    key={tbl._id}
                    onClick={() => handleSelectTable(tbl)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-900 text-white border-amber-900 shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base">Bàn {tbl.table_number}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                    </div>
                    <div className="text-[11px] opacity-80 mt-1">
                      {tbl.area === 'INDOOR'
                        ? 'Trong nhà'
                        : tbl.area === 'OUTDOOR'
                        ? 'Sân vườn'
                        : 'Ban công'}
                      {' • '}
                      {tbl.capacity} chỗ
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTableModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Order Tracking Modal */}
      {orderTrackingModalOpen && activeTrackedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-scale-up">
            {/* Header */}
            <div className="text-center space-y-1.5 border-b border-stone-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
                <Coffee className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-lg">Đã Nhận Đơn Gọi Món</h3>
              <p className="font-mono font-bold text-amber-900 text-xs">
                Mã đơn: #{activeTrackedOrder.order_code}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                Bàn {activeTrackedOrder.table_id?.table_number || selectedTable?.table_number || 'N/A'}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-3 py-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Tiến độ chế biến (Cập nhật trực tiếp)
              </div>

              <div className="space-y-3">
                {/* Step 1: Received */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div className="text-xs">
                    <strong className="text-stone-900 block">Đã tiếp nhận vào bếp</strong>
                    <span className="text-stone-400 text-[11px]">Đơn đã lưu vào hệ thống</span>
                  </div>
                </div>

                {/* Step 2: Preparing */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeTrackedOrder.status === 'PREPARING'
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100 animate-pulse'
                        : activeTrackedOrder.status === 'READY' ||
                          activeTrackedOrder.status === 'COMPLETED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {activeTrackedOrder.status === 'READY' ||
                    activeTrackedOrder.status === 'COMPLETED'
                      ? '✓'
                      : '2'}
                  </div>
                  <div className="text-xs">
                    <strong
                      className={
                        activeTrackedOrder.status === 'PREPARING'
                          ? 'text-amber-900 font-bold'
                          : 'text-stone-800'
                      }
                    >
                      Barista đang pha chế
                    </strong>
                    <span className="text-stone-400 text-[11px] block">
                      Đang chuẩn bị đồ uống theo đúng yêu cầu
                    </span>
                  </div>
                </div>

                {/* Step 3: Ready */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeTrackedOrder.status === 'READY'
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100 animate-bounce'
                        : activeTrackedOrder.status === 'COMPLETED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {activeTrackedOrder.status === 'COMPLETED' ? '✓' : '3'}
                  </div>
                  <div className="text-xs">
                    <strong
                      className={
                        activeTrackedOrder.status === 'READY'
                          ? 'text-sky-900 font-bold'
                          : 'text-stone-800'
                      }
                    >
                      Sẵn sàng phục vụ
                    </strong>
                    <span className="text-stone-400 text-[11px] block">
                      Nhân viên đang mang món ra bàn cho quý khách
                    </span>
                  </div>
                </div>

                {/* Step 4: Completed */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeTrackedOrder.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    4
                  </div>
                  <div className="text-xs">
                    <strong
                      className={
                        activeTrackedOrder.status === 'COMPLETED'
                          ? 'text-emerald-900 font-bold'
                          : 'text-stone-400'
                      }
                    >
                      Hoàn thành
                    </strong>
                    <span className="text-stone-400 text-[11px] block">
                      Chúc quý khách thưởng thức ngon miệng!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total and actions */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs">
              <span className="text-stone-600">Tổng thanh toán:</span>
              <span className="font-black text-amber-950 text-sm">
                {formatVND(activeTrackedOrder.total_amount)}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setOrderTrackingModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs"
              >
                Gọi thêm món khác
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
