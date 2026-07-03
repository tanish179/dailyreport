import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, getTodayDate } from '../../lib/constants';

const initial = {
  expense_title: '', category: 'Miscellaneous', vendor_name: '',
  amount: '', payment_method: 'Cash', date: getTodayDate(),
};

export default function ExpenseForm({ onSubmit }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.expense_title.trim()) e.expense_title = 'Required';
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
      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>New Expense</div>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Expense Title *</label>
            <input className="form-input" value={form.expense_title} onChange={e => set('expense_title', e.target.value)} placeholder="Expense title" style={errors.expense_title ? { borderColor: 'var(--accent-rose)' } : {}} />
            {errors.expense_title && <span style={{ fontSize: '0.7rem', color: 'var(--accent-rose)' }}>{errors.expense_title}</span>}
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
            <label className="form-label">Vendor Name</label>
            <input className="form-input" value={form.vendor_name} onChange={e => set('vendor_name', e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary"><Plus size={16} /> Save Expense</button>
          <button type="button" className="btn-secondary" onClick={() => { setForm({ ...initial, date: getTodayDate() }); setErrors({}); }}><RotateCcw size={16} /> Clear</button>
        </div>
      </form>
    </div>
  );
}
