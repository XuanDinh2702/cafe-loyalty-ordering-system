const API_BASE = '/api';

// Token helper
export const getToken = () => localStorage.getItem('cafe_token');
export const setToken = (token) => localStorage.setItem('cafe_token', token);
export const removeToken = () => localStorage.removeItem('cafe_token');

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('cafe_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredAuth = (data) => {
  localStorage.setItem('cafe_auth_user', JSON.stringify(data));
};

export const clearStoredAuth = () => {
  localStorage.removeItem('cafe_auth_user');
  localStorage.removeItem('cafe_token');
};

// Generic fetch wrapper
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Lỗi yêu cầu: ${response.statusText}`);
  }
  return data;
}

export const api = {
  // Auth
  loginStaff: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  customerRegister: (data) => request('/auth/customer/register', { method: 'POST', body: JSON.stringify(data) }),
  customerLogin: (data) => request('/auth/customer/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Menu
  getCategories: () => request('/menu/categories'),
  getMenuItems: (params = '') => request(`/menu/items${params}`),
  createMenuItem: (data) => request('/menu/items', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id, data) => request(`/menu/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMenuItem: (id) => request(`/menu/items/${id}`, { method: 'DELETE' }),

  createCategory: (data) => request('/menu/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/menu/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/menu/categories/${id}`, { method: 'DELETE' }),

  // Tables
  getTables: (params = '') => request(`/tables${params}`),
  updateTableStatus: (id, status) => request(`/tables/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createTable: (data) => request('/tables', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id, data) => request(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTable: (id) => request(`/tables/${id}`, { method: 'DELETE' }),

  // Reservations
  getReservations: (params = '') => request(`/reservations${params}`),
  checkAvailability: (tableId, start, end) => request(`/reservations/check-availability?table_id=${tableId}&start_time=${start}&end_time=${end}`),
  createReservation: (data) => request('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  updateReservationStatus: (id, status) => request(`/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Customers & Loyalty
  lookupCustomer: (phone) => request(`/customers/lookup?phone=${encodeURIComponent(phone)}`),
  quickCreateCustomer: (data) => request('/customers/quick-create', { method: 'POST', body: JSON.stringify(data) }),
  getCustomerProfile: (id) => request(`/customers/profile/${id}`),
  getCustomerPoints: (id) => request(`/customers/points/${id}`),
  getCustomerVouchers: (id) => request(`/customers/vouchers/${id}`),
  redeemVoucher: (data) => request('/customers/redeem-voucher', { method: 'POST', body: JSON.stringify(data) }),

  // Vouchers
  getActiveVouchers: () => request('/vouchers/active'),
  getAllVouchers: () => request('/vouchers'),
  createVoucher: (data) => request('/vouchers', { method: 'POST', body: JSON.stringify(data) }),
  updateVoucher: (id, data) => request(`/vouchers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVoucher: (id) => request(`/vouchers/${id}`, { method: 'DELETE' }),

  // Orders (POS & Table Self-Order)
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  createTableOrder: (orderData) => request('/orders/table-order', { method: 'POST', body: JSON.stringify(orderData) }),
  trackOrder: (code) => request(`/orders/track/${encodeURIComponent(code)}`),
  getOrders: (params = '') => request(`/orders${params}`),
  getOrderById: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'POST' }),

  // Admin
  getDashboardStats: () => request('/admin/dashboard-stats'),
  getStaffList: () => request('/admin/staff'),
  createStaff: (data) => request('/admin/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaffStatus: (id, status) => request(`/admin/staff/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  resetStaffPassword: (id, new_password) => request(`/admin/staff/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ new_password }) }),
  getPointAudit: (params = '') => request(`/admin/point-audit${params}`),
};

// Format Currency in VND
export const formatVND = (amount) => {
  if (amount === undefined || amount === null) return '0 ₫';
  return Number(amount).toLocaleString('vi-VN') + ' ₫';
};

// Format Date & Time
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
};

// Membership badge info
export const getTierBadge = (tier) => {
  switch (tier) {
    case 'GOLD':
      return { label: 'Hội Viên Vàng (Gold)', color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
    case 'SILVER':
      return { label: 'Hội Viên Bạc (Silver)', color: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-400' };
    case 'BRONZE':
    default:
      return { label: 'Hội Viên Đồng (Bronze)', color: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-600' };
  }
};
