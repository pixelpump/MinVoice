import { jsPDF } from 'jspdf';
import type { Invoice, Client, Settings } from './types';
import { formatDate, calcSubtotal, calcTaxTotal, calcTotal } from './utils';
import { getDefaultPairingKey, registerFontForPDF } from './fonts';

const MM = { left: 20, right: 190, top: 20, width: 170 };
const GRAY = { dark: '#1a1a1a', mid: '#555555', light: '#999999', line: '#cccccc' };

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function wrapText(pdf: jsPDF, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (pdf.getTextWidth(test) > maxWidth) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function loadImage(dataUri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUri;
  });
}

export async function generatePDF(
  invoice: Invoice,
  client: Client,
  settings: Settings,
  filename: string,
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const accent = settings.primaryColor || '#1a1a2e';
  const [ar, ag, ab] = hexToRgb(accent);
  const subtotal = calcSubtotal(invoice.lineItems);
  const taxTotal = calcTaxTotal(invoice.lineItems);
  const total = calcTotal(invoice.lineItems, invoice.discount);

  const fontKey = settings.fontPairing || getDefaultPairingKey();
  const bodyFont = await registerFontForPDF(pdf, fontKey);
  const monoFont = 'courier';

  // Load logo if present
  let logoImg: HTMLImageElement | null = null;
  if (settings.logo) {
    try {
      logoImg = await loadImage(settings.logo);
    } catch {
      // Ignore broken logo
    }
  }

  let y = MM.top;

  // ── Header ──
  // Logo
  if (logoImg) {
    const logoH = 24;
    const logoW = (logoImg.width / logoImg.height) * logoH;
    const maxW = 100;
    const finalW = Math.min(logoW, maxW);
    const finalH = finalW === logoW ? logoH : (logoH * maxW) / logoW;
    pdf.addImage(logoImg, 'PNG', MM.left, y, finalW, finalH);
    y += finalH + 4;
  }

  // Left: business info
  pdf.setFont(bodyFont, 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(ar, ag, ab);
  pdf.text(settings.businessName || 'Your Business', MM.left, y + 6);
  let leftBottom = y + 6;

  let infoY = y + 12;
  if (settings.businessAddress) {
    pdf.setFont(bodyFont, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(GRAY.light);
    const addrLines = settings.businessAddress.split('\n');
    addrLines.forEach((line, i) => {
      pdf.text(line, MM.left, infoY + i * 3.5);
    });
    infoY += addrLines.length * 3.5;
  }
  if (settings.businessEmail) {
    pdf.setFont(bodyFont, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(GRAY.light);
    pdf.text(settings.businessEmail, MM.left, infoY);
    infoY += 3.5;
  }
  if (settings.businessPhone) {
    pdf.setFont(bodyFont, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(GRAY.light);
    pdf.text(settings.businessPhone, MM.left, infoY);
    infoY += 3.5;
  }
  leftBottom = infoY;

  // Right: INVOICE / number / dates
  const rightCol = MM.right;
  pdf.setFont(bodyFont, 'normal');
  pdf.setFontSize(28);
  pdf.setTextColor(ar, ag, ab);
  pdf.text('INVOICE', rightCol, MM.top + 10, { align: 'right' });

  pdf.setFont(monoFont, 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(GRAY.dark);
  pdf.text(invoice.number, rightCol, MM.top + 17, { align: 'right' });

  pdf.setFont(bodyFont, 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(GRAY.light);
  pdf.text(`Issue: ${formatDate(invoice.issueDate)}`, rightCol, MM.top + 23, { align: 'right' });
  pdf.text(`Due: ${formatDate(invoice.dueDate)}`, rightCol, MM.top + 27, { align: 'right' });

  y = Math.max(leftBottom, MM.top + 27) + 12;

  // ── Bill To ──
  pdf.setFont(bodyFont, 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(GRAY.light);
  pdf.text('BILL TO', MM.left, y);
  y += 5;

  pdf.setFont(bodyFont, 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(GRAY.dark);
  pdf.text(client.name, MM.left, y);
  y += 5;

  pdf.setFont(bodyFont, 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(GRAY.mid);
  if (client.email) {
    pdf.text(client.email, MM.left, y);
    y += 4;
  }
  if (client.address) {
    const addrLines = client.address.split('\n');
    for (const line of addrLines) {
      pdf.text(line, MM.left, y);
      y += 4;
    }
  }
  if (client.phone) {
    pdf.text(client.phone, MM.left, y);
    y += 4;
  }

  y += 8;

  // ── Table ──
  const colDesc = MM.left;
  const colQty = MM.left + 96;
  const colRate = MM.left + 110;
  const colTax = MM.left + 130;
  const colAmt = MM.right;

  // Table header
  pdf.setDrawColor(ar, ag, ab);
  pdf.setLineWidth(0.5);
  pdf.line(MM.left, y, MM.right, y);

  pdf.setFont(bodyFont, 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(GRAY.light);
  y += 5;
  pdf.text('DESCRIPTION', colDesc, y);
  pdf.text('QTY', colQty, y, { align: 'right' });
  pdf.text('RATE', colRate, y, { align: 'right' });
  pdf.text('TAX', colTax, y, { align: 'right' });
  pdf.text('AMOUNT', colAmt, y, { align: 'right' });
  y += 2;
  pdf.line(MM.left, y, MM.right, y);
  y += 4;

  // Table rows
  pdf.setFont(bodyFont, 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(GRAY.dark);

  for (const item of invoice.lineItems) {
    const lineSubtotal = item.quantity * item.unitPrice;
    const lineTax = (lineSubtotal * item.tax) / 100;
    const lineTotal = lineSubtotal + lineTax;

    const descLines = wrapText(pdf, item.description, colQty - colDesc - 4);
    const rowStart = y;
    for (let i = 0; i < descLines.length; i++) {
      pdf.text(descLines[i], colDesc, y);
      y += 4;
    }
    const midY = rowStart + (y - rowStart) / 2;

    pdf.setFont(monoFont, 'normal');
    pdf.setFontSize(8);
    pdf.text(String(item.quantity), colQty, midY, { align: 'right' });
    pdf.text(`$${item.unitPrice.toFixed(2)}`, colRate, midY, { align: 'right' });
    pdf.text(`${item.tax}%`, colTax, midY, { align: 'right' });
    pdf.text(`$${lineTotal.toFixed(2)}`, colAmt, midY, { align: 'right' });
    pdf.setFont(bodyFont, 'normal');

    y += 2;
  }

  // Table bottom line
  pdf.setDrawColor(GRAY.line);
  pdf.setLineWidth(0.2);
  pdf.line(MM.left, y, MM.right, y);
  y += 6;

  // ── Totals ──
  const totX = MM.left + 110;
  const totV = MM.right;
  const totLine = (label: string, value: string, bold = false, size = 8) => {
    pdf.setFont(bold ? bodyFont : bodyFont, bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(bold ? GRAY.dark : GRAY.mid);
    pdf.text(label, totX, y);
    pdf.setFont(monoFont, bold ? 'bold' : 'normal');
    pdf.text(value, totV, y, { align: 'right' });
    y += 5;
  };

  totLine('Subtotal', `$${subtotal.toFixed(2)}`);
  totLine('Tax', `$${taxTotal.toFixed(2)}`);

  if (invoice.discount > 0) {
    const discountAmt = ((subtotal + taxTotal) * invoice.discount) / 100;
    totLine(`Discount (${invoice.discount}%)`, `-$${discountAmt.toFixed(2)}`);
  }

  y += 1;
  pdf.setDrawColor(ar, ag, ab);
  pdf.setLineWidth(0.5);
  pdf.line(totX, y - 1, totV, y - 1);
  y += 4;
  totLine('Total', `$${total.toFixed(2)}`, true, 11);

  y += 12;

  // ── Notes ──
  if (invoice.notes) {
    pdf.setDrawColor(GRAY.line);
    pdf.setLineWidth(0.2);
    pdf.line(MM.left, y, MM.right, y);
    y += 6;
    pdf.setFont(bodyFont, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(GRAY.mid);
    const noteLines = invoice.notes.split('\n');
    for (const line of noteLines) {
      pdf.text(line, MM.left, y);
      y += 4;
    }
    y += 4;
  }

  // ── Footer ──
  pdf.setFont(bodyFont, 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(GRAY.light);
  pdf.text('Thank you for your business.', MM.left + MM.width / 2, 282, { align: 'center' });

  pdf.save(filename);
}
