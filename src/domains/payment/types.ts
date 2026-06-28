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
