import { Badge } from "@/components/ui/badge";
import type { BookingPaymentDisplayStatus } from "@/domains/booking/types";
import {
  getOwnerBookingDisplayStatusVariant,
  OWNER_BOOKING_DISPLAY_STATUS_LABELS,
  resolveOwnerBookingDisplayStatus,
} from "@/domains/analytics/utils/owner-booking-display";
import type { BookingStatus } from "@/generated/prisma/client";

const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  CANCELLED: "Dibatalkan",
};

const bookingStatusVariants: Record<
  BookingStatus,
  "pending" | "confirmed" | "cancelled"
> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={bookingStatusVariants[status]}>
      {bookingStatusLabels[status]}
    </Badge>
  );
}

const paymentStatusLabels: Record<BookingPaymentDisplayStatus, string> = {
  NONE: "Belum Bayar",
  PENDING: "Menunggu",
  AWAITING_CONFIRMATION: "Menunggu Konfirmasi",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kadaluarsa",
  REFUNDED: "Dikembalikan",
  REJECTED: "Ditolak",
};

const paymentStatusVariants: Record<
  BookingPaymentDisplayStatus,
  "outline" | "pending" | "paid" | "expired" | "cancelled" | "secondary"
> = {
  NONE: "outline",
  PENDING: "pending",
  AWAITING_CONFIRMATION: "pending",
  PAID: "paid",
  FAILED: "cancelled",
  EXPIRED: "expired",
  REFUNDED: "secondary",
  REJECTED: "cancelled",
};

export function PaymentStatusBadge({
  status,
}: {
  status: BookingPaymentDisplayStatus;
}) {
  return (
    <Badge variant={paymentStatusVariants[status]}>
      {paymentStatusLabels[status]}
    </Badge>
  );
}

type OwnerBookingDisplayStatusBadgeProps = {
  bookingStatus: BookingStatus;
  paymentStatus: BookingPaymentDisplayStatus;
};

export function OwnerBookingDisplayStatusBadge({
  bookingStatus,
  paymentStatus,
}: OwnerBookingDisplayStatusBadgeProps) {
  const displayStatus = resolveOwnerBookingDisplayStatus(
    bookingStatus,
    paymentStatus,
  );

  return (
    <Badge variant={getOwnerBookingDisplayStatusVariant(displayStatus)}>
      {OWNER_BOOKING_DISPLAY_STATUS_LABELS[displayStatus]}
    </Badge>
  );
}
