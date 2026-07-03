import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FileDown, FileSpreadsheet, Printer } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../lib/api';
import { formatCurrency, DATE_FILTERS, CHART_COLORS } from '../lib/constants';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { filter };
      if (filter === 'custom') { params.startDate = startDate; params.endDate = endDate; }
      const res = await api.getReports(params);
      setData(res);
    } catch (e) { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [filter, startDate, endDate]);

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Business Report', 14, 22);
    doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 30);
    const m = data.metrics;
    const formatPdfCurrency = (val) => formatCurrency(val).replace(/,/g, '').replace('₹', 'Rs. ');
    autoTable(doc, {
      startY: 38, head: [['Metric', 'Value']],
      body: [
        ['Total Sales', formatPdfCurrency(m.totalSales)],
        ['Net Profit', formatPdfCurrency(m.netProfit)],
        ['Cash Sales', formatPdfCurrency(m.cashSales)],
        ['UPI Sales', formatPdfCurrency(m.upiSales)],
        ['Largest Sale', formatPdfCurrency(m.largestSale)],
        ['Largest Expense', formatPdfCurrency(m.largestExpense)],
        ['Total Transactions', String(m.totalTransactions)],
        ['Total Expenses', formatPdfCurrency(m.totalExpenses)],
      ],
      theme: 'grid', headStyles: { fillColor: [99, 102, 241] }
    });
    if (data.salesData?.length) {
      doc.addPage(); doc.setFontSize(14); doc.text('Sales Details', 14, 20);
      autoTable(doc, {
        startY: 28, head: [['Date', 'Customer', 'Product', 'Amount', 'Payment']],
        body: data.salesData.map(s => [s.date, s.customer_name, s.product_service, formatPdfCurrency(s.amount), s.payment_method]),
        theme: 'grid', headStyles: { fillColor: [99, 102, 241] }
      });
    }
    doc.save('mainframe-report.pdf');
    toast.success('PDF exported!');
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    if (data.salesData?.length) {
      const ws = XLSX.utils.json_to_sheet(data.salesData.map(s => ({ Date: s.date, Customer: s.customer_name, Product: s.product_service, Category: s.category, Amount: s.amount, Payment: s.payment_method, Invoice: s.invoice_number || '' })));
      XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    }
    if (data.expensesData?.length) {
      const ws = XLSX.utils.json_to_sheet(data.expensesData.map(e => ({ Date: e.date, Expense: e.expense_title, Category: e.category, Vendor: e.vendor_name || '', Amount: e.amount, Payment: e.payment_method })));
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    }
    XLSX.writeFile(wb, 'mainframe-report.xlsx');
    toast.success('Excel exported!');
  };

  const chartCard = { padding: '1.25rem', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' };

  if (loading) return <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Reports</h1><div className="skeleton" style={{ height: 400 }} /></div>;

  const m = data?.metrics;

  const metrics = [
    { label: 'Total Sales', value: formatCurrency(m?.totalSales || 0), color: 'var(--accent-blue)' },
    { label: 'Net Profit', value: formatCurrency(m?.netProfit || 0), color: m?.netProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' },
    { label: 'Cash Sales', value: formatCurrency(m?.cashSales || 0) },
    { label: 'UPI Sales', value: formatCurrency(m?.upiSales || 0) },
    { label: 'Largest Sale', value: formatCurrency(m?.largestSale || 0) },
    { label: 'Largest Expense', value: formatCurrency(m?.largestExpense || 0) },
    { label: 'Transactions', value: m?.totalTransactions || 0, isCurrency: false },
    { label: 'Total Expenses', value: formatCurrency(m?.totalExpenses || 0), color: 'var(--accent-rose)' },
  ];

  return (
    <div className="page-enter page-enter-active">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Analyze business performance</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 150, height: 36, fontSize: '0.8rem' }} value={filter} onChange={e => setFilter(e.target.value)}>
            {DATE_FILTERS.filter(f => f.value !== 'yesterday').map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          {filter === 'custom' && (
            <>
              <input className="form-input" type="date" style={{ width: 140, height: 36, fontSize: '0.8rem' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
              <input className="form-input" type="date" style={{ width: 140, height: 36, fontSize: '0.8rem' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </>
          )}
          <button className="btn-primary" style={{ height: 36 }} onClick={exportPDF}><FileDown size={14} /> PDF</button>
          <button className="btn-success" style={{ height: 36 }} onClick={exportExcel}><FileSpreadsheet size={14} /> Excel</button>
          <button className="btn-secondary" style={{ height: 36 }} onClick={() => window.print()}><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {metrics.map(({ label, value, color }) => (
          <div key={label} className="stat-card blue">
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: color || 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
        <div style={chartCard}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Revenue Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.charts?.revenueTrend || []}>
              <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" /><XAxis dataKey="date" fontSize={10} stroke="var(--text-muted)" /><YAxis fontSize={10} stroke="var(--text-muted)" /><Tooltip />
              <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#rg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={chartCard}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Expense Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.charts?.expenseTrend || []}>
              <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="100%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" /><XAxis dataKey="date" fontSize={10} stroke="var(--text-muted)" /><YAxis fontSize={10} stroke="var(--text-muted)" /><Tooltip />
              <Area type="monotone" dataKey="total" stroke="#f43f5e" fill="url(#eg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={chartCard}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Payment Breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart><Pie data={data?.charts?.paymentBreakdown || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>{(data?.charts?.paymentBreakdown || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: '0.72rem' }} /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
