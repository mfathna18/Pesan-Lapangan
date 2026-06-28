import type { BookingPaymentDisplayStatus } from "@/domains/booking/types";
import type { PaymentStatus } from "@/generated/prisma/client";

type PaymentSummary = {
  status: PaymentStatus;
};

export function resolveBookingPaymentDisplayStatus(
  payments: PaymentSummary[],
): BookingPaymentDisplayStatus {
  if (payments.length === 0) {
    return "NONE";
  }

  const paidPayment = payments.find((payment) => payment.status === "PAID");

  if (paidPayment) {
    return "PAID";
  }

  const latestPayment = payments[0];

  if (!latestPayment) {
    return "NONE";
  }

  switch (latestPayment.status) {
    case "PENDING":
      return "PENDING";
    case "EXPIRED":
      return "EXPIRED";
    case "FAILED":
      return "FAILED";
    case "REFUNDED":
      return "REFUNDED";
    default:
      return "NONE";
  }
}

export function formatMinuteOfDay(minute: number): string {
  const hours = Math.floor(minute / 60);
  const mins = minute % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function formatBookingDate(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) {
    return "-";
  }

  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
