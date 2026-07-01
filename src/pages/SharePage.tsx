import { useParams } from 'react-router-dom';
import { decodeSharePayload } from '../lib/share';
import InvoicePDF from '../components/invoices/InvoicePDF';

export default function SharePage() {
  const { encoded } = useParams<{ encoded: string }>();
  const payload = encoded ? decodeSharePayload(encoded) : null;

  if (!payload) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 px-4">
        <div className="text-center">
          <h1 className="text-lg sm:text-xl font-semibold text-neutral-800 mb-2">Invalid Link</h1>
          <p className="text-sm text-muted">This share link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const { invoice, client, settings } = payload;

  return (
    <div className="min-h-screen bg-neutral-100 py-4 sm:py-8 px-2 sm:px-4">
      <div className="overflow-x-auto">
        <InvoicePDF invoice={invoice} client={client} settings={settings} />
      </div>
    </div>
  );
}
