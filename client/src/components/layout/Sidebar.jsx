import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Receipt, BarChart3,
  HardDrive, Settings, Monitor
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/sales', icon: ShoppingCart, label: 'Sales' },
  { path: '/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/backup', icon: HardDrive, label: 'Backup & Restore' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem',
        display: 'flex', alignItems: 'center', gap: '12px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          width: 40, height: 40,
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Monitor size={20} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            Mainframe
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Business Dashboard
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
        <div style={{
          padding: '0 1.5rem', marginBottom: '0.5rem',
          fontSize: '0.65rem', fontWeight: 700,
          color: 'var(--text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          Menu
        </div>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.7rem',
        color: 'var(--text-muted)'
      }}>
        Mainframe Computers © 2026
      </div>
    </aside>
  );
}
