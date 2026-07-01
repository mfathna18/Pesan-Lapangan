import type { InvoiceStatus, PaymentStatus } from "@/generated/prisma/client";

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

export type PublicInvoiceData = {
  id: string;
  invoiceNumber: string;
  generatedAt: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  venueName: string;
  venueSlug: string;
  courtName: string;
  bookingDate: string;
  startMinute: number;
  endMinute: number;
  totalAmount: number;
};

export type ListOwnerInvoicesInput = {
  ownerId: string;
  page: number;
  pageSize: number;
  invoiceNumberSearch?: string;
  bookingNumberSearch?: string;
};

export type OwnerInvoiceListItem = {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  courtName: string;
  bookingDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  generatedAt: string;
};

export type ListOwnerInvoicesResult = {
  items: OwnerInvoiceListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type OwnerInvoiceDetail = {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  venueName: string;
  courtName: string;
  bookingDate: string;
  startMinute: number;
  endMinute: number;
  totalAmount: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  generatedAt: string;
  paymentMethod: string;
  paymentReference: string | null;
  paidAt: string | null;
};
