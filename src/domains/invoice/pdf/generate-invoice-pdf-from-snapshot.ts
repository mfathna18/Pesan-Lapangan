import {
  mapInvoiceSnapshotToPdfData,
  type InvoiceWithPaymentSnapshot,
} from "@/domains/invoice/pdf/invoice-pdf-mapper";
import { generateInvoicePdfBuffer } from "@/domains/invoice/pdf/invoice-pdf-generator";
import { buildInvoicePdfFilename } from "@/domains/invoice/pdf/invoice-pdf-types";

export async function generateInvoicePdfFromSnapshot(
  invoice: InvoiceWithPaymentSnapshot,
): Promise<{ buffer: Buffer; filename: string }> {
  const pdfData = mapInvoiceSnapshotToPdfData(invoice);
  const buffer = await generateInvoicePdfBuffer(pdfData);

  return {
    buffer,
    filename: buildInvoicePdfFilename(invoice.invoiceNumber),
  };
}
