export type InvoicePdfHourlyLineItem = {
  label: string;
  amount: number;
};

/**
 * Snapshot-first invoice document for PDF rendering.
 * Optional fields support future QR, logo, and signature extensions.
 */
export type InvoicePdfData = {
  invoiceNumber: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  venueName: string;
  courtName: string;
  bookingDate: Date;
  startMinute: number;
  endMinute: number;
  totalAmount: number;
  generatedAt: Date;
  paymentStatusLabel: string;
  paymentMethodLabel: string;
  paymentReference: string | null;
  paidAt: Date | null;
  hourlyLineItems?: InvoicePdfHourlyLineItem[];
  logoUrl?: string | null;
  verificationUrl?: string | null;
  digitalSignatureLabel?: string | null;
};

export type InvoicePdfRenderExtensions = {
  logoImage?: Buffer | null;
  qrCodeImage?: Buffer | null;
  digitalSignatureImage?: Buffer | null;
};

export function buildInvoicePdfFilename(invoiceNumber: string): string {
  const sanitized = invoiceNumber.replace(/[^\w.-]+/g, "_");

  return `Invoice_${sanitized}.pdf`;
}
