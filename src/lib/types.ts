export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Client {
  id?: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  createdAt: number;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
}

export interface Invoice {
  id?: number;
  number: string;
  clientId: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  notes: string;
  discount: number;
  currency: string;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  id?: number;
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  businessPhone: string;
  logo: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  defaultDueDays: number;
  invoicePrefix: string;
  nextNumber: number;
  primaryColor: string;
  fontPairing: string;
}
