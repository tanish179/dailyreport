import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, RefreshCw, ShoppingBag, User } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/constants';

export default function CustomerHistoryDialog({ customerName, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerName) return;
    setLoading(true);
    setError(null);
    api.getCustomerHistory(customerName)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load customer history.');
        setLoading(false);
      });
  }, [customerName]);

  if (!customerName) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div 
        className="dialog-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '800px', width: '95%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontWeight: 700, fontSize: '1.2rem'
            }}>
              {customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {customerName}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                {data?.customer_mobile ? `Mobile: ${data.customer_mobile}` : 'No Contact Details'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', 
              borderRadius: '50%', cursor: 'pointer', color: 'var(--text-secondary)', 
              padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.75rem' }}>
            <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading customer data...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--accent-rose)', fontSize: '0.9rem' }}>
            {error}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              {/* Total Spent */}
              <div className="stat-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Total Value
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <DollarSign size={18} />
                  {formatCurrency(data.stats.total_spent)}
                </div>
              </div>

              {/* Visit Count */}
              <div className="stat-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Transactions
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingBag size={18} />
                  {data.stats.total_visits}
                </div>
              </div>

              {/* Avg Ticket Value */}
              <div className="stat-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Avg Order Value
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <DollarSign size={18} />
                  {formatCurrency(data.stats.avg_spent)}
                </div>
              </div>

              {/* Last Visited */}
              <div className="stat-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Last Purchase
                </span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', height: '1.5rem' }}>
                  <Calendar size={16} style={{ color: 'var(--accent-violet)' }} />
                  {data.stats.last_active ? formatDate(data.stats.last_active.split(' ')[0]) : 'N/A'}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                Transaction History
              </h4>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Invoice</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Product / Service</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Method</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sales.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No sales history found.
                        </td>
                      </tr>
                    ) : (
                      data.sales.map(sale => (
                        <tr 
                          key={sale.id} 
                          style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>
                            {formatDate(sale.date)}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {sale.invoice_number || '—'}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {sale.product_service}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 20, fontSize: '0.75rem',
                              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)'
                            }}>
                              {sale.payment_method}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--accent-emerald)', fontWeight: 600, textAlign: 'right' }}>
                            {formatCurrency(sale.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
