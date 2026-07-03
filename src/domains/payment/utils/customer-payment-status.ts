import type { BookingStatus, PaymentStatus } from "@/generated/prisma/client";

export type CustomerPaymentDisplayStatus =
  | "PENDING_PAYMENT"
  | "WAITING_OWNER_CONFIRMATION"
  | "PAID"
  | "PAYMENT_REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export const CUSTOMER_PAYMENT_STATUS_LABELS: Record<
  CustomerPaymentDisplayStatus,
  string
> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  WAITING_OWNER_CONFIRMATION: "Menunggu Konfirmasi Owner",
  PAID: "Pembayaran Berhasil",
  PAYMENT_REJECTED: "Pembayaran Ditolak",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export function resolveCustomerPaymentDisplayStatus(input: {
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus | null;
  bookingDate: Date;
  referenceDate?: Date;
}): CustomerPaymentDisplayStatus {
  const referenceDate = input.referenceDate ?? new Date();

  if (input.bookingStatus === "CANCELLED") {
    return "CANCELLED";
  }

  if (input.paymentStatus === "REJECTED") {
    return "PAYMENT_REJECTED";
  }

  if (input.paymentStatus === "PAID" && input.bookingStatus === "CONFIRMED") {
    const bookingDayEnd = new Date(input.bookingDate);
    bookingDayEnd.setHours(23, 59, 59, 999);

    if (referenceDate.getTime() > bookingDayEnd.getTime()) {
      return "COMPLETED";
    }

    return "PAID";
  }

  if (input.paymentStatus === "AWAITING_CONFIRMATION") {
    return "WAITING_OWNER_CONFIRMATION";
  }

  return "PENDING_PAYMENT";
}

export function formatTimeSince(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));

  if (minutes < 1) {
    return "Baru saja";
  }

  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} jam lalu`;
  }

  const days = Math.floor(hours / 24);

  return `${days} hari lalu`;
}

export function isOwnerReminderDue(
  customerConfirmedAt: string | null,
  reminderHours: number,
): boolean {
  if (!customerConfirmedAt) {
    return false;
  }

  const diffMs = Date.now() - new Date(customerConfirmedAt).getTime();

  return diffMs >= reminderHours * 60 * 60 * 1000;
}
