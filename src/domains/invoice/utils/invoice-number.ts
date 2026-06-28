import {
  INVOICE_NUMBER_PREFIX,
  INVOICE_NUMBER_SEQUENCE_LENGTH,
} from "@/domains/invoice/constants";
import { InvoiceValidationError } from "@/domains/invoice/errors";
import type { InvoiceRepository } from "@/domains/invoice/repositories/invoice-repository";

function formatInvoiceDatePart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

export async function generateInvoiceNumber(
  generatedAt: Date,
  invoiceRepository: InvoiceRepository,
): Promise<string> {
  const datePart = formatInvoiceDatePart(generatedAt);
  const prefix = `${INVOICE_NUMBER_PREFIX}-${datePart}-`;
  const maxSequence = 10 ** INVOICE_NUMBER_SEQUENCE_LENGTH;

  for (let sequence = 1; sequence < maxSequence; sequence += 1) {
    const invoiceNumber = `${prefix}${String(sequence).padStart(INVOICE_NUMBER_SEQUENCE_LENGTH, "0")}`;
    const existing = await invoiceRepository.findByInvoiceNumber(invoiceNumber);

    if (!existing) {
      return invoiceNumber;
    }
  }

  throw new InvoiceValidationError(
    "Unable to generate a unique invoice number.",
  );
}
