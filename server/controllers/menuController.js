const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sort_order: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, sort_order } = req.body;
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const category = await Category.create({
      name,
      slug: finalSlug,
      description,
      sort_order: sort_order || 0
    });
    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, message: 'Cập nhật danh mục thành công', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const itemCount = await MenuItem.countDocuments({ category_id: req.params.id });
    if (itemCount > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa danh mục đang chứa món ăn/đồ uống' });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get menu items
exports.getMenuItems = async (req, res) => {
  try {
    const { category, search, availableOnly } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category_id = category;
    }
    if (availableOnly === 'true') {
      filter.is_available = true;
    }
    if (search) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const items = await MenuItem.find(filter)
      .populate('category_id', 'name slug')
      .sort({ name: 1 });

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { category_id, name, price, image_url, description, is_available } = req.body;
    if (!category_id || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh mục, tên món và giá bán' });
    }

    const item = await MenuItem.create({
      category_id,
      name: name.trim(),
      price: Number(price),
      image_url: image_url || '',
      description: description || '',
      is_available: is_available !== undefined ? is_available : true
    });

    const populated = await MenuItem.findById(item._id).populate('category_id', 'name slug');
    res.status(201).json({ success: true, message: 'Thêm món mới thành công', item: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('category_id', 'name slug');
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy món' });
    res.json({ success: true, message: 'Cập nhật món thành công', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Xóa món thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
