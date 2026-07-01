import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PAYMENT_METHOD_LABELS } from "@/domains/payment/constants";
import type { PublicCheckoutData } from "@/domains/payment/types";
import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { cn } from "@/lib/utils";

type CheckoutSuccessDetailsProps = {
  checkout: PublicCheckoutData;
};

function formatPaidAt(paidAt: string | null): string {
  if (!paidAt) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(paidAt));
}

export function CheckoutSuccessDetails({
  checkout,
}: CheckoutSuccessDetailsProps) {
  const invoiceHref = `/gor/${checkout.venueSlug}/checkout/${checkout.bookingId}/invoice`;
  const paymentSummary = checkout.paymentSummary;

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
            Pembayaran Berhasil
          </CardTitle>
          <CardDescription className="text-base">
            Booking Dikonfirmasi
          </CardDescription>
        </CardHeader>
      </Card>

      <Card id="booking">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Detail Booking</CardTitle>
            <Badge variant="confirmed">Dikonfirmasi</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Nomor Booking</p>
            <p className="font-medium">{checkout.bookingNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Pelanggan</p>
            <p className="font-medium">{checkout.customerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Telepon</p>
            <p className="font-medium">{checkout.customerPhone}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">GOR</p>
            <p className="font-medium">{checkout.venueName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Lapangan</p>
            <p className="font-medium">{checkout.courtName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Tanggal</p>
            <p className="font-medium">
              {formatBookingDate(checkout.bookingDate)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Waktu</p>
            <p className="font-medium">
              {formatTimeRange(checkout.startMinute, checkout.endMinute)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Durasi</p>
            <p className="font-medium">{checkout.durationMinute} menit</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Status</p>
            <p className="font-medium">Lunas</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Metode</p>
            <p className="font-medium">
              {paymentSummary
                ? PAYMENT_METHOD_LABELS[paymentSummary.method]
                : "Midtrans"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Waktu Bayar</p>
            <p className="font-medium">
              {formatPaidAt(paymentSummary?.paidAt ?? null)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total Dibayar</p>
            <p className="text-xl font-semibold">
              {formatCurrency(paymentSummary?.amount ?? checkout.totalPrice)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card id="invoice">
        <CardHeader>
          <CardTitle>Invoice</CardTitle>
          <CardDescription>
            {checkout.invoiceNumber
              ? "Invoice sudah tersedia untuk booking ini."
              : "Invoice sedang diproses. Halaman akan diperbarui otomatis."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkout.invoiceNumber ? (
            <p className="text-lg font-semibold">{checkout.invoiceNumber}</p>
          ) : (
            <p className="text-muted-foreground text-sm">Menunggu invoice...</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#booking"
              className={cn(
                buttonVariants({ size: "lg" }),
                "flex-1 sm:flex-none",
              )}
            >
              Lihat Booking
            </a>
            {checkout.invoiceNumber ? (
              <>
                <Link
                  href={invoiceHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "flex-1 sm:flex-none",
                  )}
                >
                  Lihat Invoice
                </Link>
                <a
                  href={`${invoiceHref}/pdf`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "flex-1 sm:flex-none",
                  )}
                >
                  Unduh PDF
                </a>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
