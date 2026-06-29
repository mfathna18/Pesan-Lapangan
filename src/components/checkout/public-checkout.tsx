"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPublicPaymentAction } from "@/domains/payment/actions/create-public-payment.action";
import {
  DEFAULT_PAYMENT_METHOD,
  PAYMENT_METHOD_LABELS,
} from "@/domains/payment/constants";
import type { PublicCheckoutData } from "@/domains/payment/types";
import {
  formatBookingDate,
  formatCurrency,
  formatMinuteOfDay,
} from "@/domains/booking/utils/booking-display";
import { cn } from "@/lib/utils";

type PublicCheckoutProps = {
  checkout: PublicCheckoutData;
};

function formatTimeRange(startMinute: number, endMinute: number) {
  return `${formatMinuteOfDay(startMinute)} - ${formatMinuteOfDay(endMinute)}`;
}

export function PublicCheckout({ checkout }: PublicCheckoutProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isPayable = checkout.status === "PENDING" && !checkout.hasPaidPayment;

  function handlePayNow() {
    setError(null);

    startTransition(async () => {
      const response = await createPublicPaymentAction({
        gorSlug: checkout.venueSlug,
        bookingId: checkout.bookingId,
      });

      if (!response.success) {
        setError(response.error);
        return;
      }

      window.location.href = response.data.paymentUrl;
    });
  }

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader
        gorSlug={checkout.venueSlug}
        gorName={checkout.venueName}
      />
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              Checkout
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Selesaikan Pembayaran
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Tinjau detail booking dan lanjutkan ke Midtrans.
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{checkout.bookingNumber}</CardTitle>
                <Badge variant={checkout.hasPaidPayment ? "paid" : "pending"}>
                  {checkout.hasPaidPayment ? "Paid" : checkout.status}
                </Badge>
              </div>
              <CardDescription>
                Detail booking dan informasi pelanggan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Pelanggan</p>
                <p className="font-medium">{checkout.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Telepon</p>
                <p className="font-medium">{checkout.customerPhone}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Venue</p>
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
              <div>
                <p className="text-muted-foreground text-sm">Harga</p>
                <p className="font-medium">
                  {formatCurrency(checkout.pricePerHourSnapshot)} / jam
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-sm">Total</p>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatCurrency(checkout.totalPrice)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
              <CardDescription>
                Pilih metode yang tersedia untuk menyelesaikan booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-border flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">
                    {PAYMENT_METHOD_LABELS[DEFAULT_PAYMENT_METHOD]}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Kartu, e-wallet, dan transfer via Midtrans Snap
                  </p>
                </div>
                <Badge variant="outline">MVP</Badge>
              </div>

              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-muted-foreground text-sm">
                  Total Pembayaran
                </p>
                <p className="text-xl font-semibold">
                  {formatCurrency(checkout.totalPrice)}
                </p>
              </div>

              {error ? (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              ) : null}

              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={!isPayable || isPending}
                onClick={handlePayNow}
              >
                {isPending ? "Memproses..." : "Bayar Sekarang"}
              </Button>

              {!isPayable ? (
                <p className="text-muted-foreground text-sm">
                  Booking ini tidak dapat dibayar lagi dari halaman checkout.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Link
            href={`/gor/${checkout.venueSlug}`}
            className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
          >
            Kembali ke Venue
          </Link>
        </div>
      </main>
    </div>
  );
}
