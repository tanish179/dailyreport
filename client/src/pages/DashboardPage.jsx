import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import SummaryCards from '../components/dashboard/SummaryCards';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import RecentActivity from '../components/dashboard/RecentActivity';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [s, c, r] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardCharts(),
        api.getDashboardRecent(),
      ]);
      setSummary(s);
      setCharts(c);
      setRecent(r);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter page-enter-active">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Overview of your business performance
          </p>
        </div>
        <button onClick={fetchData} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          Refresh
        </button>
      </div>

      <SummaryCards data={summary} />

      <div style={{ marginTop: '1.5rem' }}>
        <DashboardCharts data={charts} />
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <RecentActivity data={recent} />
      </div>
    </div>
  );
}
