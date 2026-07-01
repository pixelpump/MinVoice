import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useCallback } from 'react';
import { getAllInvoices, getInvoice, saveInvoice, deleteInvoice, updateInvoiceStatus } from '../lib/db';
import type { Invoice, InvoiceStatus } from '../lib/types';

export function useInvoices() {
  const invoices = useLiveQuery(() => getAllInvoices(), []) ?? [];
  const [loading, setLoading] = useState(false);

  const get = useCallback(async (id: number) => {
    return getInvoice(id);
  }, []);

  const save = useCallback(async (invoice: Invoice) => {
    setLoading(true);
    const id = await saveInvoice(invoice);
    setLoading(false);
    return id;
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    await deleteInvoice(id);
    setLoading(false);
  }, []);

  const setStatus = useCallback(async (id: number, status: InvoiceStatus) => {
    await updateInvoiceStatus(id, status);
  }, []);

  return { invoices, get, save, remove, setStatus, loading };
}
