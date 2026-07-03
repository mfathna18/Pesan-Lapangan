import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AwaitingConfirmationPaymentItem } from "@/domains/payment/types";
import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { formatTimeSince } from "@/domains/payment/utils/customer-payment-status";
import { typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type OwnerPendingPaymentsWidgetProps = {
  items: AwaitingConfirmationPaymentItem[];
};

export function OwnerPendingPaymentsWidget({
  items,
}: OwnerPendingPaymentsWidgetProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className={typography.h3}>Menunggu Konfirmasi Pembayaran</h2>
        <p className={typography.caption}>
          Pelanggan sudah menandai pembayaran. Periksa rekening atau QRIS Anda.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <Card key={item.paymentId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">
                  {item.bookingNumber}
                </CardTitle>
                {item.showReminder ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500 text-amber-700"
                  >
                    Segera periksa
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Pelanggan:</span>{" "}
                  {item.customerName}
                </p>
                <p>
                  <span className="text-muted-foreground">WhatsApp:</span>{" "}
                  {item.customerPhone}
                </p>
                <p>
                  <span className="text-muted-foreground">Lapangan:</span>{" "}
                  {item.courtName}
                </p>
                <p>
                  <span className="text-muted-foreground">Tanggal:</span>{" "}
                  {formatBookingDate(item.bookingDate)}
                </p>
                <p>
                  <span className="text-muted-foreground">Waktu:</span>{" "}
                  {formatTimeRange(item.startMinute, item.endMinute)}
                </p>
                <p>
                  <span className="text-muted-foreground">Durasi:</span>{" "}
                  {item.durationMinute} menit
                </p>
                <p className="font-semibold sm:col-span-2">
                  {formatCurrency(item.amount)}
                </p>
              </div>

              {item.customerConfirmedAt ? (
                <p className="text-muted-foreground text-xs">
                  Dikonfirmasi pelanggan{" "}
                  {formatTimeSince(item.customerConfirmedAt)}
                </p>
              ) : null}

              <Link
                href={`/dashboard/bookings/${item.bookingId}/payment`}
                className={cn(buttonVariants(), "w-full sm:w-auto")}
              >
                Lihat Detail
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
