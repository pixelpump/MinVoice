import type { InvoiceStatus } from '../../lib/types';

const config: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-neutral-100 text-neutral-600' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
