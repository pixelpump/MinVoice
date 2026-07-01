import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { getInvoice, deleteInvoice, getClient } from '../lib/db';
import { useSettings } from '../hooks/useSettings';
import { useInvoices } from '../hooks/useInvoices';
import { generatePDF } from '../lib/pdf';
import { encodeSharePayload, buildShareUrl } from '../lib/share';
import StatusBadge from '../components/shared/StatusBadge';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import InvoicePDF from '../components/invoices/InvoicePDF';

export default function InvoiceViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setStatus } = useInvoices();
  const { settings } = useSettings();
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const invoice = useLiveQuery(() => getInvoice(Number(id)), [id]);
  const client = useLiveQuery(
    () => (invoice ? getClient(invoice.clientId) : null),
    [invoice]
  );

  if (!invoice || !client) {
    return (
      <div className="text-center py-20 text-sm text-muted">Loading...</div>
    );
  }

  const handlePDF = async () => {
    if (!invoice || !client) return;
    setGenerating(true);
    await generatePDF(invoice, client, settings, `Invoice-${invoice.number}.pdf`);
    setGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = async () => {
    const encoded = encodeSharePayload({ invoice, client, settings });
    const url = buildShareUrl(encoded);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!invoice.id) return;
    await deleteInvoice(invoice.id);
    navigate('/invoices', { replace: true });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Action bar */}
      <div className="no-print space-y-3">
        <div className="flex items-center gap-3">
          <Link
            to="/invoices"
            className="text-sm text-muted hover:text-neutral-800 transition-colors shrink-0"
          >
            ← Back
          </Link>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900 truncate">
            {invoice.number}
          </h2>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/invoices/${invoice.id}/edit`}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleCopyShareLink}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Print
          </button>
          <button
            onClick={handlePDF}
            disabled={generating}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold text-white bg-accent rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'PDF'}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Status quick-change */}
      <div className="no-print flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-white border border-border rounded-lg overflow-x-auto">
        <span className="text-xs font-medium text-muted mr-1 sm:mr-2 shrink-0">Mark as:</span>
        {(['draft', 'sent', 'paid', 'overdue'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(invoice.id!, s)}
            className={`shrink-0 px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              invoice.status === s
                ? 'bg-accent text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoice preview */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <InvoicePDF invoice={invoice} client={client} settings={settings} />
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${invoice.number}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
