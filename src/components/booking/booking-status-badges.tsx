import { Badge } from "@/components/ui/badge";
import type { BookingPaymentDisplayStatus } from "@/domains/booking/types";
import type { BookingStatus } from "@/generated/prisma/client";

const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
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
  NONE: "No Payment",
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
};

const paymentStatusVariants: Record<
  BookingPaymentDisplayStatus,
  "outline" | "pending" | "paid" | "expired" | "cancelled" | "secondary"
> = {
  NONE: "outline",
  PENDING: "pending",
  PAID: "paid",
  FAILED: "cancelled",
  EXPIRED: "expired",
  REFUNDED: "secondary",
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
