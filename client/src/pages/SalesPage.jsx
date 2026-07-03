import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import SaleForm from '../components/sales/SaleForm';
import SalesTable from '../components/sales/SalesTable';
import EditSaleDialog from '../components/sales/EditSaleDialog';
import CustomerHistoryDialog from '../components/sales/CustomerHistoryDialog';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('month');
  const [sort, setSort] = useState('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [editSale, setEditSale] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, filter, sort, page, limit: 15 };
      if (filter === 'custom') { params.startDate = startDate; params.endDate = endDate; }
      const data = await api.getSales(params);
      setSales(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) { toast.error('Failed to load sales'); }
    finally { setLoading(false); }
  }, [search, filter, sort, page, startDate, endDate]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const handleCreate = async (formData) => {
    try {
      await api.createSale(formData);
      toast.success('Sale recorded successfully!');
      setPage(1);
      fetchSales();
    } catch (e) { toast.error(e.message); }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await api.updateSale(id, formData);
      toast.success('Sale updated!');
      setEditSale(null);
      fetchSales();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sale record?')) return;
    try {
      await api.deleteSale(id);
      toast.success('Sale deleted');
      fetchSales();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="page-enter page-enter-active">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Sales</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Record and manage all sales transactions
        </p>
      </div>

      <SaleForm onSubmit={handleCreate} />

      <div style={{ marginTop: '1.5rem' }}>
        <SalesTable
          sales={sales} total={total} page={page} totalPages={totalPages}
          search={search} filter={filter} sort={sort}
          startDate={startDate} endDate={endDate}
          loading={loading}
          onSearchChange={setSearch} onFilterChange={(v) => { setFilter(v); setPage(1); }}
          onSortChange={(v) => { setSort(v); setPage(1); }}
          onStartDateChange={setStartDate} onEndDateChange={setEndDate}
          onPageChange={setPage} onEdit={setEditSale} onDelete={handleDelete}
          onCustomerClick={setSelectedCustomer}
        />
      </div>

      {editSale && (
        <EditSaleDialog sale={editSale} onSave={handleUpdate} onClose={() => setEditSale(null)} />
      )}

      {selectedCustomer && (
        <CustomerHistoryDialog customerName={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
}
