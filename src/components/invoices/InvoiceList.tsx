import { Link } from 'react-router-dom';
import StatusBadge from '../shared/StatusBadge';
import { formatCurrency, formatDate, calcTotal } from '../../lib/utils';
import type { Invoice, Client } from '../../lib/types';

interface Props {
  invoices: Invoice[];
  clients: Client[];
}

export default function InvoiceList({ invoices, clients }: Props) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted">
        No invoices found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="border-b border-border bg-neutral-50/50 text-left">
            <th className="px-4 py-3 font-medium text-muted">Number</th>
            <th className="px-4 py-3 font-medium text-muted">Client</th>
            <th className="px-4 py-3 font-medium text-muted hidden sm:table-cell">Issue</th>
            <th className="px-4 py-3 font-medium text-muted hidden sm:table-cell">Due</th>
            <th className="px-4 py-3 font-medium text-muted text-right">Total</th>
            <th className="px-4 py-3 font-medium text-muted">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const client = clients.find((c) => c.id === inv.clientId);
            return (
              <tr
                key={inv.id}
                className="border-b border-border last:border-0 hover:bg-neutral-50/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/invoices/${inv.id}`}
                    className="font-mono text-accent hover:underline font-medium"
                  >
                    {inv.number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {client?.name ?? <span className="text-muted italic">Unknown</span>}
                </td>
                <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">{formatDate(inv.issueDate)}</td>
                <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatCurrency(calcTotal(inv.lineItems, inv.discount), inv.currency)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
