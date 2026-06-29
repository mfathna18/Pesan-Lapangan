import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/generated/prisma/client";

const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
};

const paymentStatusVariants: Record<
  PaymentStatus,
  "pending" | "paid" | "expired" | "cancelled" | "secondary" | "outline"
> = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "cancelled",
  EXPIRED: "expired",
  REFUNDED: "secondary",
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
