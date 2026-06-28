import type { InvoiceStatus } from "@/generated/prisma/client";

export type CreateInvoiceInput = {
  paymentId: string;
  invoiceNumber: string;
  bookingNumberSnapshot: string;
  customerNameSnapshot: string;
  customerPhoneSnapshot: string;
  gorNameSnapshot: string;
  courtNameSnapshot: string;
  bookingDateSnapshot: Date;
  startMinuteSnapshot: number;
  endMinuteSnapshot: number;
  totalAmountSnapshot: number;
  status?: InvoiceStatus;
  generatedAt?: Date;
};

export type GenerateInvoiceInput = {
  paymentId: string;
};

export type VoidInvoiceInput = {
  id: string;
};

export type FindInvoiceByPaymentIdInput = {
  paymentId: string;
};
