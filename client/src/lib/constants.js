export const SALE_CATEGORIES = [
  'Laptop', 'Desktop', 'Printer', 'Accessories', 'Repair',
  'CCTV', 'Networking', 'Software', 'Other'
];

export const EXPENSE_CATEGORIES = [
  'Rent', 'Electricity', 'Salary', 'Tea & Snacks', 'Transport',
  'Internet', 'Spare Parts', 'Marketing', 'Stationery', 'Maintenance', 'Miscellaneous'
];

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit'];

export const DATE_FILTERS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
  { value: 'all', label: 'All Time' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Amount' },
  { value: 'lowest', label: 'Lowest Amount' },
];

export function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const h = parseInt(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export const CHART_COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316'];
