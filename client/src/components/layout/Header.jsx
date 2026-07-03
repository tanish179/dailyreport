import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/constants';
import CustomerHistoryDialog from '../sales/CustomerHistoryDialog';

export default function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults(null); return; }
    const timer = setTimeout(async () => {
      try {
        const data = await api.search(query);
        setResults(data);
        setOpen(true);
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (type) => {
    setOpen(false);
    setQuery('');
    navigate(type === 'sale' ? '/sales' : '/expenses');
  };

  const handleSelectSale = (customerName) => {
    setSelectedCustomer(customerName);
    setOpen(false);
    setQuery('');
  };

  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
    }}>
      {/* Search */}
      <div ref={ref} style={{ position: 'relative', width: 400 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36, height: 40 }}
            placeholder="Search sales, expenses, customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results && setOpen(true)}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults(null); setOpen(false); }}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 4
              }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {open && results && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
            background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            maxHeight: 400, overflowY: 'auto', zIndex: 60
          }}>
            {results.sales.length === 0 && results.expenses.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No results found
              </div>
            ) : (
              <>
                {results.sales.length > 0 && (
                  <div>
                    <div style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Sales ({results.sales.length})
                    </div>
                    {results.sales.map(s => (
                      <div key={`s-${s.id}`} onClick={() => handleSelectSale(s.customer_name)}
                        style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.customer_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.product_service}</div>
                        </div>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.85rem' }}>
                          {formatCurrency(s.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {results.expenses.length > 0 && (
                  <div>
                    <div style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderTop: '1px solid var(--border-subtle)' }}>
                      Expenses ({results.expenses.length})
                    </div>
                    {results.expenses.map(e => (
                      <div key={`e-${e.id}`} onClick={() => handleSelect('expense')}
                        style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-card-hover)'}
                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{e.expense_title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.vendor_name || e.category}</div>
                        </div>
                        <span style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.85rem' }}>
                          {formatCurrency(e.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {selectedCustomer && (
        <CustomerHistoryDialog 
          customerName={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
        />
      )}
    </header>
  );
}
