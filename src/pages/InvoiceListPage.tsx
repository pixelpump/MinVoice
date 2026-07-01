import { Link, useSearchParams } from 'react-router-dom';
import { useInvoices } from '../hooks/useInvoices';
import { useClients } from '../hooks/useClients';
import { useSearch } from '../hooks/useSearch';
import InvoiceList from '../components/invoices/InvoiceList';
import EmptyState from '../components/shared/EmptyState';

export default function InvoiceListPage() {
  const { invoices } = useInvoices();
  const { clients } = useClients();
  const [searchParams, setSearchParams] = useSearchParams();
  const { query, setQuery, statusFilter, setStatusFilter, filtered } = useSearch(invoices);

  const statusFromUrl = searchParams.get('status');
  if (statusFromUrl && statusFilter !== statusFromUrl) {
    setStatusFilter(statusFromUrl);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Invoices</h2>
          <p className="text-sm text-muted mt-1">
            {filtered.length} of {invoices.length} invoices
          </p>
        </div>
        <Link
          to="/invoices/new"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg hover:opacity-90 transition-opacity inline-block w-fit"
        >
          New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by number or description..."
          className="flex-1 max-w-full sm:max-w-xs px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'draft', 'sent', 'paid', 'overdue'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                if (s === 'all') {
                  setSearchParams({});
                } else {
                  setSearchParams({ status: s });
                }
              }}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === s
                  ? 'bg-accent text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first invoice to get started."
          action={
            <Link
              to="/invoices/new"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg hover:opacity-90 transition-opacity"
            >
              New Invoice
            </Link>
          }
        />
      ) : (
        <InvoiceList invoices={filtered} clients={clients} />
      )}
    </div>
  );
}
