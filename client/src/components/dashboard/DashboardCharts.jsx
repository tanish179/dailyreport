import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { CHART_COLORS } from '../../lib/constants';

const chartCardStyle = {
  padding: '1.25rem',
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-lg)',
};

const titleStyle = {
  fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
      borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  );
};

function formatXDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function DashboardCharts({ data }) {
  if (!data) return null;

  const { dailySales, paymentDistribution } = data;

  const filteredPaymentDistribution = paymentDistribution?.filter(
    item => ['Cash', 'UPI', 'Credit'].includes(item.name)
  );

  const PAYMENT_COLOR_MAP = {
    Cash: '#10b981',   // Emerald/Green
    UPI: '#3b82f6',    // Blue
    Credit: '#f43f5e'  // Rose/Red
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
      {/* Daily Sales Trend */}
      <div style={chartCardStyle}>
        <div style={titleStyle}>Daily Sales Trend</div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={dailySales}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis dataKey="date" tickFormatter={formatXDate} stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#salesGrad)" strokeWidth={2} name="Sales" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Method Distribution */}
      <div style={chartCardStyle}>
        <div style={titleStyle}>Payment Method Distribution</div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={filteredPaymentDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
              {filteredPaymentDistribution?.map((entry, i) => (
                <Cell key={i} fill={PAYMENT_COLOR_MAP[entry.name] || '#6366f1'} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
