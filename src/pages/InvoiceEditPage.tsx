import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../hooks/useInvoices';
import InvoiceForm from '../components/invoices/InvoiceForm';
import type { Invoice } from '../lib/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { getInvoice } from '../lib/db';

export default function InvoiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { save } = useInvoices();
  const invoice = useLiveQuery(() => getInvoice(Number(id)), [id]);

  const handleSave = async (invoice: Invoice) => {
    await save(invoice);
    navigate(`/invoices/${invoice.id}`, { replace: true });
    return invoice.id!;
  };

  if (!invoice) {
    return (
      <div className="text-center py-20 text-sm text-muted">Loading...</div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
          Edit Invoice {invoice.number}
        </h2>
      </div>
      <InvoiceForm initial={invoice} onSave={handleSave} />
    </div>
  );
}
