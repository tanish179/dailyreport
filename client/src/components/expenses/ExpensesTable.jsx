import { Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, DATE_FILTERS, SORT_OPTIONS } from '../../lib/constants';

export default function ExpensesTable({
  expenses, total, page, totalPages, search, filter, sort,
  startDate, endDate, loading,
  onSearchChange, onFilterChange, onSortChange,
  onStartDateChange, onEndDateChange,
  onPageChange, onEdit, onDelete
}) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          Expense History <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({total})</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: 32, width: 200, height: 36, fontSize: '0.8rem' }} placeholder="Search..." value={search} onChange={e => onSearchChange(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 140, height: 36, fontSize: '0.8rem' }} value={filter} onChange={e => onFilterChange(e.target.value)}>
            {DATE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          {filter === 'custom' && (
            <>
              <input className="form-input" type="date" style={{ width: 140, height: 36, fontSize: '0.8rem' }} value={startDate} onChange={e => onStartDateChange(e.target.value)} />
              <input className="form-input" type="date" style={{ width: 140, height: 36, fontSize: '0.8rem' }} value={endDate} onChange={e => onEndDateChange(e.target.value)} />
            </>
          )}
          <select className="form-select" style={{ width: 150, height: 36, fontSize: '0.8rem' }} value={sort} onChange={e => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 44 }} />)}</div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">No expenses found</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Time</th><th>Expense</th><th>Vendor</th><th>Amount</th><th>Payment</th><th>Actions</th></tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td>{formatDate(e.date)}</td>
                    <td>{formatTime(e.time)}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{e.expense_title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{e.vendor_name || '—'}</td>
                    <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{formatCurrency(e.amount)}</td>
                    <td><span className="badge badge-blue">{e.payment_method}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => onEdit(e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--accent-blue)' }}><Pencil size={14} /></button>
                        <button onClick={() => onDelete(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--accent-rose)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <div className="pagination">
                <button className="pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={16} /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p; if (totalPages <= 7) p = i + 1; else if (page <= 4) p = i + 1; else if (page >= totalPages - 3) p = totalPages - 6 + i; else p = page - 3 + i;
                  return <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>;
                })}
                <button className="pagination-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
