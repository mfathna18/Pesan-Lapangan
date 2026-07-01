import type { Invoice } from "@/generated/prisma/client";

import type { PaymentMethod } from "@/generated/prisma/client";

import { PAYMENT_METHOD_LABELS } from "@/domains/payment/constants";
import { getInvoicePaymentStatusLabel } from "@/domains/invoice/utils/invoice-display";
import type { InvoicePdfData } from "@/domains/invoice/pdf/invoice-pdf-types";

export type InvoiceWithPaymentSnapshot = Invoice & {
  payment: {
    method: PaymentMethod;
    status: string;
    externalReference: string | null;
    paidAt: Date | null;
  };
};

export function mapInvoiceSnapshotToPdfData(
  invoice: InvoiceWithPaymentSnapshot,
): InvoicePdfData {
  return {
    invoiceNumber: invoice.invoiceNumber,
    bookingNumber: invoice.bookingNumberSnapshot,
    customerName: invoice.customerNameSnapshot,
    customerPhone: invoice.customerPhoneSnapshot,
    venueName: invoice.gorNameSnapshot,
    courtName: invoice.courtNameSnapshot,
    bookingDate: invoice.bookingDateSnapshot,
    startMinute: invoice.startMinuteSnapshot,
    endMinute: invoice.endMinuteSnapshot,
    totalAmount: invoice.totalAmountSnapshot,
    generatedAt: invoice.generatedAt,
    paymentStatusLabel: getInvoicePaymentStatusLabel(invoice.payment.status),
    paymentMethodLabel:
      PAYMENT_METHOD_LABELS[invoice.payment.method] ?? invoice.payment.method,
    paymentReference: invoice.payment.externalReference ?? invoice.paymentId,
    paidAt: invoice.payment.paidAt ?? invoice.generatedAt,
    hourlyLineItems: undefined,
    logoUrl: null,
    verificationUrl: null,
    digitalSignatureLabel: null,
  };
}
