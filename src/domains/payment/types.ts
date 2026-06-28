import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

export type CreatePaymentInput = {
  bookingId: string;
  amount: number;
  method?: PaymentMethod;
  externalReference?: string | null;
  expiredAt?: Date | null;
};

export type UpdatePaymentInput = {
  id: string;
  status?: PaymentStatus;
  externalReference?: string | null;
  paidAt?: Date | null;
  expiredAt?: Date | null;
};

export type FindPaymentsByBookingIdInput = {
  bookingId: string;
};

export type MarkPaymentAsPaidInput = {
  id: string;
  externalReference: string;
  paidAt?: Date;
};

export type MarkPaymentStatusInput = {
  id: string;
};

export type CreatePaymentRequest = {
  bookingId: string;
};

export type CreatePaymentResult = {
  paymentUrl: string;
  token: string;
  transactionId: string;
};

export type MidtransCallbackPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_time?: string;
};
