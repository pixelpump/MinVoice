import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../hooks/useInvoices';
import InvoiceForm from '../components/invoices/InvoiceForm';
import type { Invoice } from '../lib/types';

export default function InvoiceNewPage() {
  const navigate = useNavigate();
  const { save } = useInvoices();

  const handleSave = async (invoice: Invoice) => {
    const id = await save(invoice);
    navigate(`/invoices/${id}`, { replace: true });
    return id;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">New Invoice</h2>
        <p className="text-sm text-muted mt-1">Create a new invoice</p>
      </div>
      <InvoiceForm onSave={handleSave} />
    </div>
  );
}
