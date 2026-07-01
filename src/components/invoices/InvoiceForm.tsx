import { type FormEvent, useState, useCallback, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { useClients } from '../../hooks/useClients';
import { useSettings } from '../../hooks/useSettings';
import { useLineItemHistory } from '../../hooks/useLineItemHistory';
import { todayISO, addDaysISO, calcSubtotal, calcTaxTotal, calcTotal, generateInvoiceNumber } from '../../lib/utils';
import type { Invoice, LineItem, InvoiceStatus } from '../../lib/types';
import LineItemRow from './LineItemRow';

interface Props {
  initial?: Invoice;
  onSave: (invoice: Invoice) => Promise<number>;
}

export default function InvoiceForm({ initial, onSave }: Props) {
  const { clients } = useClients();
  const { settings } = useSettings();
  const history = useLineItemHistory();
  const formRef = useRef<HTMLFormElement>(null);

  const [clientId, setClientId] = useState(initial?.clientId ?? 0);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [number, setNumber] = useState(
    initial?.number ?? generateInvoiceNumber(settings.invoicePrefix, settings.nextNumber)
  );
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? todayISO());
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ?? addDaysISO(todayISO(), settings.defaultDueDays)
  );
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initial?.lineItems ?? [
      { id: uuid(), description: '', quantity: 1, unitPrice: 0, tax: settings.defaultTaxRate },
    ]
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [discount, setDiscount] = useState(initial?.discount ?? 0);
  const [status, setStatus] = useState<InvoiceStatus>(initial?.status ?? 'draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedClient = clients.find((c) => c.id === clientId);
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const addLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      { id: uuid(), description: '', quantity: 1, unitPrice: 0, tax: settings.defaultTaxRate },
    ]);
  }, [settings.defaultTaxRate]);

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((li) => li.id !== id);
    });
  }, []);

  const updateLineItem = useCallback((id: string, field: keyof LineItem, value: number | string) => {
    setLineItems((prev) =>
      prev.map((li) => (li.id === id ? { ...li, [field]: value } : li))
    );
  }, []);

  const subtotal = calcSubtotal(lineItems);
  const taxTotal = calcTaxTotal(lineItems);
  const total = calcTotal(lineItems, discount);

  const handleSubmit = useCallback(
    async (e: FormEvent, st: InvoiceStatus = status) => {
      e.preventDefault();
      if (!clientId) {
        setError('Please select a client.');
        return;
      }
      const hasEmptyLine = lineItems.some((li) => !li.description || li.unitPrice <= 0);
      if (hasEmptyLine) {
        setError('Please fill in all line items with a description and rate.');
        return;
      }
      setError('');
      setSaving(true);
      const invoice: Invoice = {
        id: initial?.id,
        number,
        clientId,
        status: st,
        issueDate,
        dueDate,
        lineItems,
        notes,
        discount,
        currency: settings.defaultCurrency,
        createdAt: initial?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };
      await onSave(invoice);
      setSaving(false);
    },
    [clientId, number, status, issueDate, dueDate, lineItems, notes, discount, settings.defaultCurrency, initial, onSave]
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Header row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Client</label>
          <div className="relative">
            {selectedClient && !showClientPicker ? (
              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-white">
                <div>
                  <p className="text-sm font-medium">{selectedClient.name}</p>
                  <p className="text-xs text-muted">{selectedClient.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setClientId(0);
                    setClientSearch('');
                    setShowClientPicker(true);
                  }}
                  className="text-xs text-muted hover:text-neutral-800"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientPicker(true);
                  }}
                  onFocus={() => setShowClientPicker(true)}
                  onBlur={() => setTimeout(() => setShowClientPicker(false), 150)}
                  placeholder="Search clients..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                {showClientPicker && filteredClients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setClientId(c.id!);
                          setClientSearch(c.name);
                          setShowClientPicker(false);
                        }}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted ml-2">{c.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Invoice #</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-800">Line Items</h3>
          <button
            type="button"
            onClick={addLineItem}
            className="text-xs font-medium text-accent hover:underline"
          >
            + Add item
          </button>
        </div>
        <div className="space-y-2">
          {lineItems.map((item, i) => (
            <LineItemRow
              key={item.id}
              item={item}
              index={i}
              onChange={(field, value) => updateLineItem(item.id, field, value)}
              onRemove={() => removeLineItem(item.id)}
              canRemove={lineItems.length > 1}
              currency={settings.defaultCurrency}
              history={history}
            />
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full sm:w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Tax</span>
            <span className="font-mono">${taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Discount (%)</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              min={0}
              max={100}
              className="w-20 px-2 py-1 border border-border rounded text-sm text-right font-mono"
            />
          </div>
          <div className="flex justify-between text-base font-semibold border-t border-border pt-2">
            <span>Total</span>
            <span className="font-mono">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Payment terms, thank you note, etc."
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : initial ? 'Update Invoice' : 'Save Draft'}
        </button>
        {status === 'draft' && (
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, 'sent')}
            className="px-6 py-2.5 text-sm font-semibold text-accent bg-accent/10 rounded-lg hover:bg-accent/15 transition-colors disabled:opacity-50"
          >
            Save & Mark as Sent
          </button>
        )}
      </div>
    </form>
  );
}
