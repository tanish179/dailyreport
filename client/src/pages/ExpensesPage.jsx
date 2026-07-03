import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpensesTable from '../components/expenses/ExpensesTable';
import EditExpenseDialog from '../components/expenses/EditExpenseDialog';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [editExpense, setEditExpense] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, filter, sort, page, limit: 15 };
      if (filter === 'custom') { params.startDate = startDate; params.endDate = endDate; }
      const data = await api.getExpenses(params);
      setExpenses(data.data); setTotal(data.total); setTotalPages(data.totalPages);
    } catch (e) { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  }, [search, filter, sort, page, startDate, endDate]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleCreate = async (formData) => {
    try { await api.createExpense(formData); toast.success('Expense recorded!'); setPage(1); fetchExpenses(); }
    catch (e) { toast.error(e.message); }
  };

  const handleUpdate = async (id, formData) => {
    try { await api.updateExpense(id, formData); toast.success('Expense updated!'); setEditExpense(null); fetchExpenses(); }
    catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.deleteExpense(id); toast.success('Expense deleted'); fetchExpenses(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="page-enter page-enter-active">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Expenses</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Record and manage all shop expenses</p>
      </div>
      <ExpenseForm onSubmit={handleCreate} />
      <div style={{ marginTop: '1.5rem' }}>
        <ExpensesTable expenses={expenses} total={total} page={page} totalPages={totalPages}
          search={search} filter={filter} sort={sort} startDate={startDate} endDate={endDate} loading={loading}
          onSearchChange={setSearch} onFilterChange={(v) => { setFilter(v); setPage(1); }}
          onSortChange={(v) => { setSort(v); setPage(1); }} onStartDateChange={setStartDate}
          onEndDateChange={setEndDate} onPageChange={setPage} onEdit={setEditExpense} onDelete={handleDelete} />
      </div>
      {editExpense && <EditExpenseDialog expense={editExpense} onSave={handleUpdate} onClose={() => setEditExpense(null)} />}
    </div>
  );
}
