const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),
  getDashboardCharts: () => request('/dashboard/charts'),
  getDashboardRecent: () => request('/dashboard/recent'),

  // Sales
  getSales: (params) => request(`/sales?${new URLSearchParams(params)}`),
  createSale: (data) => request('/sales', { method: 'POST', body: JSON.stringify(data) }),
  updateSale: (id, data) => request(`/sales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSale: (id) => request(`/sales/${id}`, { method: 'DELETE' }),
  getSalesCustomers: () => request('/sales/customers'),
  getCustomerHistory: (name) => request(`/sales/customer/history?name=${encodeURIComponent(name)}`),

  // Expenses
  getExpenses: (params) => request(`/expenses?${new URLSearchParams(params)}`),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Reports
  getReports: (params) => request(`/reports?${new URLSearchParams(params)}`),

  // Backup
  createBackup: () => request('/backup/create', { method: 'POST' }),
  listBackups: () => request('/backup/list'),
  restoreBackup: (filename) => request('/backup/restore', { method: 'POST', body: JSON.stringify({ filename }) }),
  deleteBackup: (filename) => request(`/backup/${filename}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Search
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  // AI API
  uploadToAI: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/ai/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Upload failed');
    }
    return res.json();
  },
  
  chatWithAI: async (message) => {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
};
