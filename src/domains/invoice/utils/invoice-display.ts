import type { InvoiceStatus, PaymentStatus } from "@/generated/prisma/client";

export const INVOICE_PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Lunas",
  PENDING: "Menunggu",
  FAILED: "Gagal",
  EXPIRED: "Kadaluarsa",
  REFUNDED: "Dikembalikan",
};

export const INVOICE_RECORD_STATUS_LABELS: Record<InvoiceStatus, string> = {
  GENERATED: "Lunas",
  VOID: "Dibatalkan",
};

export function getInvoicePaymentStatusLabel(status: string): string {
  return (
    INVOICE_PAYMENT_STATUS_LABELS[status as PaymentStatus] ??
    INVOICE_RECORD_STATUS_LABELS[status as InvoiceStatus] ??
    status
  );
}

export function getInvoiceDisplayStatusLabel(
  invoiceStatus: InvoiceStatus,
  paymentStatus: string,
): string {
  if (invoiceStatus === "VOID") {
    return INVOICE_RECORD_STATUS_LABELS.VOID;
  }

  return getInvoicePaymentStatusLabel(paymentStatus);
}

export type InvoiceDisplayStatusVariant =
  "paid" | "pending" | "cancelled" | "expired" | "outline";

export function getInvoiceDisplayStatusVariant(
  invoiceStatus: InvoiceStatus,
  paymentStatus: string,
): InvoiceDisplayStatusVariant {
  if (invoiceStatus === "VOID") {
    return "cancelled";
  }

  switch (paymentStatus) {
    case "PAID":
      return "paid";
    case "PENDING":
      return "pending";
    case "FAILED":
      return "cancelled";
    case "EXPIRED":
      return "expired";
    case "REFUNDED":
      return "outline";
    default:
      return "outline";
  }
}

export function getDurationMinutesFromSnapshot(
  startMinute: number,
  endMinute: number,
): number {
  return Math.max(0, endMinute - startMinute);
}
