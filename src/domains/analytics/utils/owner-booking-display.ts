import type { BookingPaymentDisplayStatus } from "@/domains/booking/types";
import type { BookingStatus } from "@/generated/prisma/client";

export type OwnerBookingDisplayStatus =
  "LUNAS" | "MENUNGGU" | "GAGAL" | "KADALUARSA" | "DIKONFIRMASI" | "DIBATALKAN";

export const OWNER_BOOKING_DISPLAY_STATUS_LABELS: Record<
  OwnerBookingDisplayStatus,
  string
> = {
  LUNAS: "Lunas",
  MENUNGGU: "Menunggu",
  GAGAL: "Gagal",
  KADALUARSA: "Kadaluarsa",
  DIKONFIRMASI: "Dikonfirmasi",
  DIBATALKAN: "Dibatalkan",
};

export function resolveOwnerBookingDisplayStatus(
  bookingStatus: BookingStatus,
  paymentStatus: BookingPaymentDisplayStatus,
): OwnerBookingDisplayStatus {
  if (bookingStatus === "CANCELLED") {
    return "DIBATALKAN";
  }

  if (paymentStatus === "FAILED") {
    return "GAGAL";
  }

  if (paymentStatus === "EXPIRED") {
    return "KADALUARSA";
  }

  if (paymentStatus === "PAID") {
    return "LUNAS";
  }

  if (
    paymentStatus === "PENDING" ||
    paymentStatus === "AWAITING_CONFIRMATION" ||
    bookingStatus === "PENDING"
  ) {
    return "MENUNGGU";
  }

  if (paymentStatus === "REJECTED") {
    return "GAGAL";
  }

  if (bookingStatus === "CONFIRMED") {
    return "DIKONFIRMASI";
  }

  return "MENUNGGU";
}

export type OwnerBookingDisplayStatusVariant =
  "paid" | "pending" | "cancelled" | "expired" | "confirmed" | "outline";

export function getOwnerBookingDisplayStatusVariant(
  status: OwnerBookingDisplayStatus,
): OwnerBookingDisplayStatusVariant {
  switch (status) {
    case "LUNAS":
      return "paid";
    case "MENUNGGU":
      return "pending";
    case "GAGAL":
    case "DIBATALKAN":
      return "cancelled";
    case "KADALUARSA":
      return "expired";
    case "DIKONFIRMASI":
      return "confirmed";
    default:
      return "outline";
  }
}
