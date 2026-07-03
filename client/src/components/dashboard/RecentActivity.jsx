import { ShoppingCart, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../lib/constants';

export default function RecentActivity({ data }) {
  if (!data?.length) {
    return (
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Activity</div>
        <div className="empty-state">No recent transactions</div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Activity</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {data.map((item, i) => (
          <div key={`${item.type}-${item.id}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', borderRadius: 'var(--radius)',
            transition: 'background 0.15s',
            cursor: 'default',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: item.type === 'sale' ? 'var(--accent-emerald-glow)' : 'var(--accent-rose-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.type === 'sale' ?
                  <ArrowUpRight size={16} style={{ color: 'var(--accent-emerald)' }} /> :
                  <ArrowDownRight size={16} style={{ color: 'var(--accent-rose)' }} />
                }
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.subtitle || item.category} · {formatDate(item.date)} · {formatTime(item.time)}
                </div>
              </div>
            </div>
            <div style={{
              fontWeight: 700, fontSize: '0.9rem',
              color: item.type === 'sale' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
            }}>
              {item.type === 'sale' ? '+' : '−'}{formatCurrency(item.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
