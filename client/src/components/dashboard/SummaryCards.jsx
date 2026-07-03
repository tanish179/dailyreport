import {
  TrendingUp, TrendingDown, IndianRupee, CreditCard,
  Smartphone, Banknote, ShoppingCart, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { formatCurrency } from '../../lib/constants';

const cards = [
  { key: 'todaySales', label: "Today's Sales", color: 'blue', icon: TrendingUp, positive: true },
  { key: 'monthlySales', label: 'Monthly Sales', color: 'violet', icon: ArrowUpRight, positive: true },
  { key: 'cashSales', label: 'Cash Sales Today', color: 'emerald', icon: Banknote },
  { key: 'upiSales', label: 'UPI Sales Today', color: 'blue', icon: Smartphone },
  { key: 'todayExpenses', label: "Today's Expenses", color: 'rose', icon: TrendingDown, positive: false },
  { key: 'monthlyExpenses', label: 'Monthly Expenses', color: 'amber', icon: ArrowDownRight, positive: false },
];

export default function SummaryCards({ data }) {
  if (!data) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1rem',
    }}>
      {cards.map(({ key, label, color, icon: Icon, isCurrency = true }, i) => (
        <div key={key} className={`stat-card ${color} count-up`} style={{ animationDelay: `${i * 0.05}s` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8
              }}>
                {label}
              </div>
              <div style={{
                fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)',
                lineHeight: 1.2
              }}>
                {isCurrency ? formatCurrency(data[key] || 0) : data[key] || 0}
              </div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `var(--accent-${color}-glow, rgba(99,102,241,0.15))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={18} style={{ color: `var(--accent-${color}, #6366f1)` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
