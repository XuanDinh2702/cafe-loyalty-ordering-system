import React, { useState, useEffect } from 'react';
import { Search, Coffee, Sparkles, Plus, Check } from 'lucide-react';
import { api, formatVND } from '../../services/api';

export default function MenuPage({ onAddToCart }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsRes, itemsRes] = await Promise.all([
        api.getCategories(),
        api.getMenuItems()
      ]);
      setCategories(catsRes.categories || []);
      setItems(itemsRes.items || []);
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category_id?._id === selectedCategory || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleAdd = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
      setAddedNotice(item._id);
      setTimeout(() => setAddedNotice(null), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#b87552_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> README Artisan Roastery & Teahouse
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans text-stone-100">
            Hương Vị Tinh Tế, Trải Nghiệm Thượng Hạng
          </h1>
          <p className="max-w-2xl mx-auto text-stone-300 text-sm sm:text-base leading-relaxed">
            Tuyển chọn hạt cà phê Đắk Lắk nguyên bản, trà hoa thượng hạng và bánh ngọt nướng tươi trong ngày. Tích lũy điểm hội viên nhận hàng trăm ưu đãi hấp dẫn.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200/80 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm món theo tên hoặc nguyên liệu..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white"
              />
            </div>

            {/* Total count badge */}
            <div className="text-xs text-stone-500 font-medium self-end sm:self-center">
              Hiển thị <span className="font-bold text-stone-900">{filteredItems.length}</span> món
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Tất Cả Món ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat._id
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8">
            <Coffee className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-800 text-lg">Không tìm thấy món phù hợp</h3>
            <p className="text-xs text-stone-500 mt-1">Vui lòng thử tìm với từ khóa khác hoặc chuyển danh mục.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const isAdded = addedNotice === item._id;
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  {/* Item Image */}
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                          Tạm hết hàng
                        </span>
                      </div>
                    )}
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-stone-900/80 backdrop-blur-sm text-white text-[11px] font-semibold rounded-lg">
                      {item.category_id?.name?.split(' ')[0] || 'Món'}
                    </span>
                  </div>

                  {/* Item Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base group-hover:text-amber-800 transition">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description || 'Thức uống được pha chế thủ công thơm ngon đặc trưng.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-stone-400 block leading-none">Đơn giá</span>
                        <span className="font-extrabold text-base text-amber-900">
                          {formatVND(item.price)}
                        </span>
                      </div>

                      {item.is_available && onAddToCart && (
                        <button
                          onClick={() => handleAdd(item)}
                          className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-100/80 hover:bg-amber-800 text-amber-900 hover:text-white'
                          }`}
                          title="Thêm vào đơn hàng"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4" /> Đã thêm
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Chọn món
                            </>
                          )}
                        </button>
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
  );
}
