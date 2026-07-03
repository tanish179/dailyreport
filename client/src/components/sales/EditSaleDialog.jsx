import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { SALE_CATEGORIES, PAYMENT_METHODS } from '../../lib/constants';
import { api } from '../../lib/api';

export default function EditSaleDialog({ sale, onSave, onClose }) {
  const [form, setForm] = useState({ ...sale });
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.getSalesCustomers()
      .then(setCustomers)
      .catch(err => console.error('Failed to load customers', err));
  }, []);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.product_service || !form.amount) return;
    onSave(sale.id, form);
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
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Edit Sale</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Customer Name</label>
              <input className="form-input" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} list="edit-customers-list" />
              <datalist id="edit-customers-list">
                {customers.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div><label className="form-label">Product / Service</label><input className="form-input" value={form.product_service} onChange={e => set('product_service', e.target.value)} /></div>
            <div><label className="form-label">Amount (₹)</label><input className="form-input" type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
            <div><label className="form-label">Payment Method</label><select className="form-select" value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>{PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
            <div><label className="form-label">Invoice</label><input className="form-input" value={form.invoice_number || ''} onChange={e => set('invoice_number', e.target.value)} /></div>
            <div><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Save size={16} /> Update Sale</button>
          </div>
        </form>
      </div>
    </div>
  );
}
