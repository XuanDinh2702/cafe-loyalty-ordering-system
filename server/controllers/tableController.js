const Table = require('../models/Table');

exports.getTables = async (req, res) => {
  try {
    const { area, status } = req.query;
    const filter = {};
    if (area && area !== 'all') filter.area = area;
    if (status && status !== 'all') filter.status = status;

    const tables = await Table.find(filter).sort({ table_number: 1 });
    res.json({ success: true, tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const { table_number, capacity, area, status } = req.body;
    if (!table_number || !capacity) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập số bàn và sức chứa' });
    }

    const table = await Table.create({
      table_number: table_number.toUpperCase().trim(),
      capacity: Number(capacity),
      area: area || 'INDOOR',
      status: status || 'AVAILABLE'
    });

    res.status(201).json({ success: true, message: 'Thêm bàn thành công', table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ success: false, message: 'Không tìm thấy bàn' });
    res.json({ success: true, message: 'Cập nhật bàn thành công', table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Xóa bàn thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!table) return res.status(404).json({ success: false, message: 'Không tìm thấy bàn' });
    res.json({ success: true, message: 'Cập nhật trạng thái bàn thành công', table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
