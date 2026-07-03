import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HardDrive, Download, Upload, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  const fetchBackups = async () => {
    setLoading(true);
    try { setBackups(await api.listBackups()); }
    catch (e) { toast.error('Failed to load backups'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    try {
      await api.createBackup();
      toast.success('Backup created!');
      fetchBackups();
    } catch (e) { toast.error(e.message); }
  };

  const handleRestore = async (filename) => {
    if (!confirm(`Restore database from ${filename}? This will replace all current data.`)) return;
    try {
      setRestoring(filename);
      await api.restoreBackup(filename);
      toast.success('Backup restored! Please refresh the page.');
    } catch (e) { toast.error(e.message); }
    finally { setRestoring(null); }
  };

  const handleDelete = async (filename) => {
    if (!confirm(`Delete backup ${filename}?`)) return;
    try { await api.deleteBackup(filename); toast.success('Backup deleted'); fetchBackups(); }
    catch (e) { toast.error(e.message); }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="page-enter page-enter-active">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Backup & Restore</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Manage database backups</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}><Download size={16} /> Create Backup</button>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--accent-amber)' }}>
          <AlertTriangle size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Restoring a backup will replace your current database. Make sure to create a backup first.</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Available Backups</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 56 }} />)}</div>
        ) : backups.length === 0 ? (
          <div className="empty-state">
            <HardDrive size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div>No backups yet. Click "Create Backup" to get started.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {backups.map(b => (
              <div key={b.filename} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 'var(--radius)',
                border: '1px solid var(--border-subtle)',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <HardDrive size={18} style={{ color: 'var(--accent-blue)' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{b.filename}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={12} /> {new Date(b.created).toLocaleString('en-IN')} · {formatSize(b.size)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleRestore(b.filename)} disabled={restoring === b.filename}>
                    <Upload size={12} /> {restoring === b.filename ? 'Restoring...' : 'Restore'}
                  </button>
                  <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleDelete(b.filename)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
