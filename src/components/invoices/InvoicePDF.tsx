import type { Invoice, Client, Settings } from '../../lib/types';
import { formatDate, calcSubtotal, calcTaxTotal, calcTotal } from '../../lib/utils';

interface Props {
  invoice: Invoice;
  client: Client;
  settings: Settings;
}

export default function InvoicePDF({ invoice, client, settings }: Props) {
  const subtotal = calcSubtotal(invoice.lineItems);
  const taxTotal = calcTaxTotal(invoice.lineItems);
  const total = calcTotal(invoice.lineItems, invoice.discount);
  const c = settings.primaryColor || '#1a1a2e';
  const headingFont = `var(--font-heading, Inter)`;
  const bodyFont = `var(--font-body, Inter)`;

  return (
    <div
      className="max-w-[800px] mx-auto p-4 sm:p-10 bg-white text-neutral-900 min-w-fit"
      style={{ fontFamily: bodyFont }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 mb-8 sm:mb-12">
        <div>
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-20 mb-4 object-contain" />
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: c, fontFamily: headingFont }}>
            {settings.businessName || 'Your Business'}
          </h1>
          {settings.businessAddress && (
            <p className="text-sm text-neutral-500 mt-1 whitespace-pre-line">{settings.businessAddress}</p>
          )}
          {settings.businessEmail && (
            <p className="text-sm text-neutral-500">{settings.businessEmail}</p>
          )}
          {settings.businessPhone && (
            <p className="text-sm text-neutral-500">{settings.businessPhone}</p>
          )}
        </div>
        <div className="sm:text-right">
          <h2 className="text-2xl sm:text-3xl font-light tracking-wide" style={{ color: c, fontFamily: headingFont }}>
            INVOICE
          </h2>
          <p className="text-base sm:text-lg font-mono font-medium mt-1">{invoice.number}</p>
          <div className="mt-3 sm:mt-4 text-sm text-neutral-500 space-y-0.5">
            <p>Issue: {formatDate(invoice.issueDate)}</p>
            <p>Due: {formatDate(invoice.dueDate)}</p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          Bill To
        </p>
        <p className="text-base font-medium">{client.name}</p>
        {client.email && <p className="text-sm text-neutral-500">{client.email}</p>}
        {client.address && <p className="text-sm text-neutral-500 whitespace-pre-line">{client.address}</p>}
        {client.phone && <p className="text-sm text-neutral-500">{client.phone}</p>}
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 mb-8">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr style={{ borderBottom: `2px solid ${c}` }}>
              <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Description
              </th>
              <th className="text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 w-16">
                Qty
              </th>
              <th className="text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 w-24">
                Rate
              </th>
              <th className="text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 w-16">
                Tax
              </th>
              <th className="text-right py-3 pl-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 w-28">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, i) => {
              const lineSubtotal = item.quantity * item.unitPrice;
              const lineTax = (lineSubtotal * item.tax) / 100;
              return (
                <tr key={item.id} className={i % 2 === 0 ? 'bg-neutral-50/30' : ''}>
                  <td className="py-2.5 pr-4">{item.description}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{item.quantity}</td>
                  <td className="py-2.5 px-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{item.tax}%</td>
                  <td className="py-2.5 pl-2 text-right font-mono">
                    ${(lineSubtotal + lineTax).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8 sm:mb-12">
        <div className="w-full sm:w-56 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Tax</span>
            <span className="font-mono">${taxTotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-500">Discount ({invoice.discount}%)</span>
              <span className="font-mono">-${((subtotal + taxTotal) * invoice.discount / 100).toFixed(2)}</span>
            </div>
          )}
          <div
            className="flex justify-between text-base font-bold pt-2"
            style={{ borderTop: `2px solid ${c}` }}
          >
            <span>Total</span>
            <span className="font-mono">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div
          className="text-sm text-neutral-500 border-t border-neutral-200 pt-6"
          style={{ whiteSpace: 'pre-line' }}
        >
          {invoice.notes}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 sm:mt-12 pt-6 text-center text-xs text-neutral-400">
        <p>Thank you for your business.</p>
      </div>
    </div>
  );
}
