import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, RefreshCw, ShoppingBag, User, FileDown, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
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

  const exportPDF = async () => {
    if (!data || !data.sales) return;
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(99, 102, 241); doc.text("Mainframe Computers", 14, 18);
    doc.setFontSize(12); doc.setTextColor(100, 116, 139); doc.text(`Customer History: ${customerName}`, 14, 26);
    doc.setFontSize(10); doc.setTextColor(0, 0, 0);
    if (data.customer_mobile) {
      doc.text(`Mobile: ${data.customer_mobile}`, 14, 32);
    }
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, data.customer_mobile ? 38 : 32);
    
    const startY = data.customer_mobile ? 44 : 38;
    const formatPdfCurrency = (val) => formatCurrency(val).replace(/,/g, '').replace('₹', 'Rs. ') + '/-';
    
    autoTable(doc, {
      startY: startY,
      head: [['Metric', 'Value']],
      body: [
        ['Total Spent', formatPdfCurrency(data.stats.total_spent)],
        ['Total Transactions', String(data.stats.total_visits)],
        ['Average Order Value', formatPdfCurrency(data.stats.avg_spent)],
        ['Last Purchase Date', data.stats.last_active ? data.stats.last_active.split(' ')[0] : 'N/A'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    doc.setFontSize(14);
    doc.text('Transaction Details', 14, doc.lastAutoTable.finalY + 12);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Date', 'Invoice', 'Product / Service', 'Payment Method', 'Amount']],
      body: data.sales.map(s => [
        s.date,
        s.invoice_number || '—',
        s.product_service,
        s.payment_method,
        formatPdfCurrency(s.amount)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    doc.save(`${customerName.replace(/\s+/g, '_')}_history.pdf`);
    toast.success('PDF exported!');
  };

  const exportExcel = async () => {
    if (!data || !data.sales) return;
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    
    const summaryData = [
      { Metric: 'Company', Value: 'Mainframe Computers' },
      { Metric: 'Customer Name', Value: customerName },
      { Metric: 'Mobile', Value: data.customer_mobile || '—' },
      { Metric: 'Total Spent', Value: data.stats.total_spent },
      { Metric: 'Total Transactions', Value: data.stats.total_visits },
      { Metric: 'Average Order Value', Value: data.stats.avg_spent },
      { Metric: 'Last Purchase Date', Value: data.stats.last_active || '—' },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    
    const salesData = data.sales.map(s => ({
      Date: s.date,
      Time: s.time || '',
      Invoice: s.invoice_number || '',
      'Product / Service': s.product_service,
      Category: s.category || '',
      'Payment Method': s.payment_method,
      Amount: s.amount
    }));
    const wsSales = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, wsSales, 'Transactions');
    
    XLSX.writeFile(wb, `${customerName.replace(/\s+/g, '_')}_history.xlsx`);
    toast.success('Excel exported!');
  };

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                  Transaction History
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-primary" style={{ height: 30, padding: '0 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={exportPDF}>
                    <FileDown size={12} /> PDF
                  </button>
                  <button className="btn-success" style={{ height: 30, padding: '0 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={exportExcel}>
                    <FileSpreadsheet size={12} /> Excel
                  </button>
                </div>
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)', maxHeight: '350px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Date</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Invoice</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Product / Service</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Method</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right', position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Amount</th>
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
