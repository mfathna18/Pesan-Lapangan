import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/generated/prisma/client";

const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Menunggu",
  AWAITING_CONFIRMATION: "Menunggu Konfirmasi",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Dikembalikan",
  REJECTED: "Ditolak",
};

const paymentStatusVariants: Record<
  PaymentStatus,
  "pending" | "paid" | "expired" | "cancelled" | "secondary" | "outline"
> = {
  PENDING: "pending",
  AWAITING_CONFIRMATION: "pending",
  PAID: "paid",
  FAILED: "cancelled",
  EXPIRED: "expired",
  REFUNDED: "secondary",
  REJECTED: "cancelled",
};

export function PaymentRecordStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  return (
    <Badge variant={paymentStatusVariants[status]}>
      {paymentStatusLabels[status]}
    </Badge>
  );
}
