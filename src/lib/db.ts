import Dexie, { type Table } from 'dexie';
import type { Client, Invoice, Settings, InvoiceStatus, LineItem } from './types';

class MinVoiceDB extends Dexie {
  clients!: Table<Client, number>;
  invoices!: Table<Invoice, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super('minvoice');
    this.version(1).stores({
      clients: '++id, name, createdAt',
      invoices: '++id, number, clientId, status, createdAt',
      settings: '++id',
    });
  }
}

export const db = new MinVoiceDB();

// --- Client helpers ---

export async function getAllClients(): Promise<Client[]> {
  return db.clients.orderBy('name').toArray();
}

export async function getClient(id: number): Promise<Client | undefined> {
  return db.clients.get(id);
}

export async function saveClient(client: Client): Promise<number> {
  if (client.id) {
    await db.clients.update(client.id, client);
    return client.id;
  }
  return db.clients.add(client);
}

export async function deleteClient(id: number): Promise<void> {
  const linked = await db.invoices.where('clientId').equals(id).count();
  if (linked > 0) {
    throw new Error(`Cannot delete client with ${linked} linked invoice(s).`);
  }
  await db.clients.delete(id);
}

// --- Invoice helpers ---

export async function getAllInvoices(): Promise<Invoice[]> {
  return db.invoices.orderBy('createdAt').reverse().toArray();
}

export async function getInvoice(id: number): Promise<Invoice | undefined> {
  return db.invoices.get(id);
}

export async function saveInvoice(invoice: Invoice): Promise<number> {
  if (invoice.id) {
    await db.invoices.update(invoice.id, { ...invoice, updatedAt: Date.now() });
    return invoice.id;
  }
  return db.invoices.add({ ...invoice, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function deleteInvoice(id: number): Promise<void> {
  await db.invoices.delete(id);
}

export async function updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<void> {
  await db.invoices.update(id, { status, updatedAt: Date.now() });
}

export async function getInvoicesByStatus(status: InvoiceStatus): Promise<Invoice[]> {
  return db.invoices.where('status').equals(status).toArray();
}

export async function getInvoiceCountByStatus(): Promise<Record<InvoiceStatus, number>> {
  const all = await db.invoices.toArray();
  const counts: Record<InvoiceStatus, number> = { draft: 0, sent: 0, paid: 0, overdue: 0 };
  for (const inv of all) {
    counts[inv.status]++;
  }
  return counts;
}

// --- Settings helpers ---

export async function getSettings(): Promise<Settings | undefined> {
  return db.settings.get(1);
}

export async function saveSettings(settings: Settings): Promise<number> {
  if (settings.id) {
    await db.settings.update(settings.id, settings);
    return settings.id;
  }
  const id = await db.settings.add(settings);
  return typeof id === 'number' ? id : 0;
}

// --- Data export/import ---

export async function exportAllData(): Promise<string> {
  const data = {
    clients: await db.clients.toArray(),
    invoices: await db.invoices.toArray(),
    settings: await db.settings.toArray(),
  };
  return JSON.stringify(data, null, 2);
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);
  await db.transaction('rw', db.clients, db.invoices, db.settings, async () => {
    await db.clients.clear();
    await db.invoices.clear();
    await db.settings.clear();
    if (data.clients) {
      for (const c of data.clients) {
        const { id, ...rest } = c;
        await db.clients.add(rest);
      }
    }
    if (data.invoices) {
      for (const i of data.invoices) {
        const { id, ...rest } = i;
        await db.invoices.add(rest);
      }
    }
    if (data.settings) {
      for (const s of data.settings) {
        const { id, ...rest } = s;
        await db.settings.add(rest);
      }
    }
  });
}

export async function getLineItemHistory(): Promise<LineItem[]> {
  const invoices = await db.invoices.orderBy('createdAt').reverse().toArray();
  const seen = new Map<string, LineItem>();
  for (const inv of invoices) {
    for (const item of inv.lineItems) {
      const key = item.description.trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.set(key, { ...item, description: item.description.trim() });
      }
    }
  }
  return Array.from(seen.values());
}
