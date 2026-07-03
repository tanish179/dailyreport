import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, Sun, Moon } from 'lucide-react';
import { api } from '../lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({ business_name: '', owner_name: '', currency: '₹', theme: 'dark' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getSettings();
        setSettings(s);
        document.documentElement.setAttribute('data-theme', s.theme);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    try {
      await api.updateSettings(settings);
      document.documentElement.setAttribute('data-theme', settings.theme);
      toast.success('Settings saved!');
    } catch (e) { toast.error(e.message); }
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings(prev => ({ ...prev, theme: newTheme }));
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (loading) return <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Settings</h1><div className="skeleton" style={{ height: 300 }} /></div>;

  return (
    <div className="page-enter page-enter-active">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Configure your business dashboard</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Business Info */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>Business Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Business Name</label>
              <input className="form-input" value={settings.business_name} onChange={e => setSettings(prev => ({ ...prev, business_name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Owner Name</label>
              <input className="form-input" value={settings.owner_name} onChange={e => setSettings(prev => ({ ...prev, owner_name: e.target.value }))} placeholder="Enter owner name" />
            </div>
            <div>
              <label className="form-label">Currency</label>
              <input className="form-input" value={settings.currency} onChange={e => setSettings(prev => ({ ...prev, currency: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>Appearance</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Theme</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Currently using {settings.theme === 'dark' ? 'Dark' : 'Light'} mode
              </div>
            </div>
            <button onClick={toggleTheme} style={{
              width: 48, height: 48, borderRadius: 12,
              background: settings.theme === 'dark' ? 'var(--accent-blue-glow)' : 'rgba(245,158,11,0.15)',
              border: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {settings.theme === 'dark' ? <Moon size={20} style={{ color: 'var(--accent-blue)' }} /> : <Sun size={20} style={{ color: '#f59e0b' }} />}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <button className="btn-primary" onClick={handleSave}><Save size={16} /> Save Settings</button>
      </div>
    </div>
  );
}
