import { useState, useMemo } from 'react';
import type { Invoice } from '../lib/types';

export function useSearch(invoices: Invoice[]) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesQuery =
        !query ||
        inv.number.toLowerCase().includes(query.toLowerCase()) ||
        inv.lineItems.some((li) => li.description.toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [invoices, query, statusFilter]);

  return { query, setQuery, statusFilter, setStatusFilter, filtered };
}
