export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateInvoiceNumber(prefix: string, next: number): string {
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export function calcLineTotal(qty: number, price: number, taxPct: number): number {
  const subtotal = qty * price;
  return subtotal + (subtotal * taxPct) / 100;
}

export function calcSubtotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function calcTaxTotal(items: { quantity: number; unitPrice: number; tax: number }[]): number {
  return items.reduce((sum, item) => {
    const line = item.quantity * item.unitPrice;
    return sum + (line * item.tax) / 100;
  }, 0);
}

export function calcTotal(items: { quantity: number; unitPrice: number; tax: number }[], discount: number): number {
  const subtotal = calcSubtotal(items);
  const tax = calcTaxTotal(items);
  const total = subtotal + tax;
  return total - (total * discount) / 100;
}
