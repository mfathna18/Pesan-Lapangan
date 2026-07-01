import { Badge } from "@/components/ui/badge";
import {
  getInvoiceDisplayStatusLabel,
  getInvoiceDisplayStatusVariant,
} from "@/domains/invoice/utils/invoice-display";
import type { InvoiceStatus } from "@/generated/prisma/client";

type InvoiceStatusBadgeProps = {
  invoiceStatus: InvoiceStatus;
  paymentStatus: string;
};

export function InvoiceStatusBadge({
  invoiceStatus,
  paymentStatus,
}: InvoiceStatusBadgeProps) {
  const label = getInvoiceDisplayStatusLabel(invoiceStatus, paymentStatus);
  const variant = getInvoiceDisplayStatusVariant(invoiceStatus, paymentStatus);

  return <Badge variant={variant}>{label}</Badge>;
}
