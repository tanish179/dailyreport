import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../lib/constants';

export default function EditExpenseDialog({ expense, onSave, onClose }) {
  const [form, setForm] = useState({ ...expense });
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.expense_title || !form.amount) return;
    onSave(expense.id, form);
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

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Edit Expense</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label className="form-label">Expense Title</label><input className="form-input" value={form.expense_title} onChange={e => set('expense_title', e.target.value)} /></div>
            <div><label className="form-label">Amount (₹)</label><input className="form-input" type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
            <div><label className="form-label">Payment Method</label><select className="form-select" value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>{PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
            <div><label className="form-label">Vendor</label><input className="form-input" value={form.vendor_name || ''} onChange={e => set('vendor_name', e.target.value)} /></div>
            <div><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Save size={16} /> Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}
