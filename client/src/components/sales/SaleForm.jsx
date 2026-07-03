import { useState, useEffect } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { SALE_CATEGORIES, PAYMENT_METHODS, getTodayDate } from '../../lib/constants';
import { api } from '../../lib/api';

const initial = {
  customer_name: '', product_service: '',
  category: 'Other', amount: '', payment_method: 'Cash',
  invoice_number: '', date: getTodayDate(),
};

export default function SaleForm({ onSubmit }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.getSalesCustomers()
      .then(setCustomers)
      .catch(err => console.error('Failed to load customers', err));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = 'Required';
    if (!form.product_service.trim()) e.product_service = 'Required';
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Must be > 0';
    if (!form.date) e.date = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, amount: parseFloat(form.amount) });
    setForm({ ...initial, date: getTodayDate() });
    setErrors({});
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const tagName = e.target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'select') {
        e.preventDefault();
        const formEl = e.currentTarget;
        const focusable = Array.from(formEl.querySelectorAll('input:not([disabled]), select:not([disabled]), button[type="submit"]'));
        const index = focusable.indexOf(e.target);
        if (index > -1 && index < focusable.length - 1) {
          focusable[index + 1].focus();
        }
      }
    }
  };

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>New Sale</div>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Customer Name *</label>
            <input className="form-input" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Customer name" list="customers-list" style={errors.customer_name ? { borderColor: 'var(--accent-rose)' } : {}} />
            <datalist id="customers-list">
              {customers.map(c => <option key={c} value={c} />)}
            </datalist>
            {errors.customer_name && <span style={{ fontSize: '0.7rem', color: 'var(--accent-rose)' }}>{errors.customer_name}</span>}
          </div>
          <div>
            <label className="form-label">Product / Service *</label>
            <input className="form-input" value={form.product_service} onChange={e => set('product_service', e.target.value)} placeholder="Product or service" style={errors.product_service ? { borderColor: 'var(--accent-rose)' } : {}} />
            {errors.product_service && <span style={{ fontSize: '0.7rem', color: 'var(--accent-rose)' }}>{errors.product_service}</span>}
          </div>
          <div>
            <label className="form-label">Amount (₹) *</label>
            <input className="form-input" type="number" step="0.01" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" style={errors.amount ? { borderColor: 'var(--accent-rose)' } : {}} />
            {errors.amount && <span style={{ fontSize: '0.7rem', color: 'var(--accent-rose)' }}>{errors.amount}</span>}
          </div>
          <div>
            <label className="form-label">Payment Method</label>
            <select className="form-select" value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Invoice Number</label>
            <input className="form-input" value={form.invoice_number} onChange={e => set('invoice_number', e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary"><Plus size={16} /> Save Sale</button>
          <button type="button" className="btn-secondary" onClick={() => { setForm({ ...initial, date: getTodayDate() }); setErrors({}); }}>
            <RotateCcw size={16} /> Clear
          </button>
        </div>
      </form>
    </div>
  );
}
