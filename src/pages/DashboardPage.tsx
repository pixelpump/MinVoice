import { Link } from 'react-router-dom';
import { useInvoices } from '../hooks/useInvoices';
import { useClients } from '../hooks/useClients';
import { useSettings } from '../hooks/useSettings';
import { getInvoiceCountByStatus } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatCurrency, calcTotal } from '../lib/utils';
import type { InvoiceStatus } from '../lib/types';

export default function DashboardPage() {
  const { invoices } = useInvoices();
  const { clients } = useClients();
  const { settings, isConfigured } = useSettings();
  const counts = useLiveQuery(() => getInvoiceCountByStatus(), []) ?? {
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
  };

  const recent = invoices.slice(0, 5);
  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + calcTotal(i.lineItems, i.discount), 0);

  const statCards: { label: string; value: string; sub: string; status: InvoiceStatus }[] = [
    { label: 'Draft', value: String(counts.draft), sub: 'invoices', status: 'draft' },
    { label: 'Sent', value: String(counts.sent), sub: 'outstanding', status: 'sent' },
    { label: 'Paid', value: String(counts.paid), sub: 'invoices', status: 'paid' },
    { label: 'Overdue', value: String(counts.overdue), sub: 'need attention', status: 'overdue' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Dashboard</h2>
          <p className="text-sm text-muted mt-1">Overview of your invoicing</p>
        </div>
        <Link
          to="/invoices/new"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg hover:opacity-90 transition-opacity inline-block w-fit"
        >
          New Invoice
        </Link>
      </div>

      {!isConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Set up your business details in{' '}
          <Link to="/settings" className="font-semibold underline">
            Settings
          </Link>{' '}
          to personalize your invoices.
        </div>
      )}

      {/* Revenue */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
          Total Revenue (Paid)
        </p>
        <p className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight">
          {formatCurrency(totalRevenue, settings.defaultCurrency)}
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <Link
            key={card.status}
            to={`/invoices?status=${card.status}`}
            className="bg-white border border-border rounded-xl p-3 sm:p-4 hover:border-accent/30 transition-colors"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 sm:mb-3">
              {card.label}
            </p>
            <p className="text-xl sm:text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted mt-1">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent invoices */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm font-semibold text-neutral-800">Recent Invoices</h3>
          <Link to="/invoices" className="text-xs text-accent hover:underline font-medium">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-6 sm:p-8 text-center text-sm text-muted">
            No invoices yet.{' '}
            <Link to="/invoices/new" className="text-accent hover:underline font-medium">
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted">Number</th>
                  <th className="px-4 py-3 font-medium text-muted">Client</th>
                  <th className="px-4 py-3 font-medium text-muted text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inv) => {
                  const client = clients.find((c) => c.id === inv.clientId);
                  return (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-neutral-50/50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="font-mono text-accent hover:underline font-medium"
                        >
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        {client?.name ?? <span className="text-muted italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(calcTotal(inv.lineItems, inv.discount), inv.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
