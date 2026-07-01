"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";

import {
  BookingExpirationCountdown,
  isCheckoutExpired,
} from "@/components/checkout/booking-expiration-countdown";
import { CheckoutSuccessDetails } from "@/components/checkout/checkout-success-details";
import {
  CheckoutExpiredState,
  CheckoutStatusBanner,
} from "@/components/checkout/checkout-state-panels";
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
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { cn } from "@/lib/utils";

type PublicCheckoutProps = {
  checkout: PublicCheckoutData;
};

const EXPIRY_ERROR_PATTERNS = [
  "waktu pembayaran",
  "payment window",
  "tidak dapat dibayar",
  "cannot be paid",
  "sudah habis",
  "expired",
] as const;

function isExpiryRelatedError(message: string): boolean {
  const normalized = message.toLowerCase();

  return EXPIRY_ERROR_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function toFriendlyPaymentError(message: string): string {
  if (isExpiryRelatedError(message)) {
    return "";
  }

  if (
    message.includes("Gagal membuat pembayaran") ||
    message.includes("gateway")
  ) {
    return "Gagal memulai pembayaran. Silakan coba lagi sebentar lagi.";
  }

  if (message.includes("tidak ditemukan") || message.includes("not found")) {
    return "Checkout ini sudah tidak tersedia.";
  }

  return "Gagal memulai pembayaran. Silakan coba lagi.";
}

export function PublicCheckout({ checkout }: PublicCheckoutProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isExpired, setIsExpired] = useState(() =>
    isCheckoutExpired(checkout.expiresAt, checkout.status),
  );

  const handleExpired = useCallback(() => {
    setIsExpired(true);
    setError(null);
  }, []);

  const isPaid = checkout.hasPaidPayment;
  const isPayable =
    !isExpired &&
    checkout.status === "PENDING" &&
    !isPaid &&
    new Date(checkout.expiresAt).getTime() > Date.now();

  const payButtonLabel = checkout.hasPendingPayment
    ? "Lanjutkan Pembayaran"
    : "Bayar Sekarang";

  function handlePayNow() {
    setError(null);

    startTransition(async () => {
      const response = await createPublicPaymentAction({
        gorSlug: checkout.venueSlug,
        bookingId: checkout.bookingId,
      });

      if (!response.success) {
        if (isExpiryRelatedError(response.error)) {
          setIsExpired(true);
          setError(null);
          return;
        }

        setError(toFriendlyPaymentError(response.error));
        return;
      }

      window.location.href = response.data.paymentUrl;
    });
  }

  if (isPaid) {
    return (
      <div className="bg-background min-h-screen">
        <CourtDetailHeader
          gorSlug={checkout.venueSlug}
          gorName={checkout.venueName}
        />
        <main className="px-4 py-8 sm:px-6 lg:py-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-8">
            <CheckoutSuccessDetails checkout={checkout} />
          </div>
        </main>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-background min-h-screen">
        <CourtDetailHeader
          gorSlug={checkout.venueSlug}
          gorName={checkout.venueName}
        />
        <main className="px-4 py-8 sm:px-6 lg:py-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-8">
            <CheckoutExpiredState
              venueSlug={checkout.venueSlug}
              venueName={checkout.venueName}
            />
          </div>
        </main>
      </div>
    );
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
              Pembayaran
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Selesaikan Pembayaran
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Tinjau detail booking dan lanjutkan ke pembayaran.
            </p>
          </div>

          <CheckoutStatusBanner
            label="Menunggu Pembayaran"
            description="Selesaikan pembayaran sebelum waktu habis untuk mengamankan slotmu."
          />

          <BookingExpirationCountdown
            expiresAt={checkout.expiresAt}
            onExpired={handleExpired}
          />

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{checkout.bookingNumber}</CardTitle>
                <Badge variant="pending">Menunggu</Badge>
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
                Lanjutkan ke Midtrans Snap untuk menyelesaikan booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-border rounded-xl border p-4">
                <p className="font-medium">
                  {PAYMENT_METHOD_LABELS[DEFAULT_PAYMENT_METHOD]}
                </p>
                <p className="text-muted-foreground text-sm">
                  Kartu, e-wallet, dan transfer bank via Midtrans Snap
                </p>
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
                <div
                  className="border-destructive/30 bg-destructive/5 rounded-xl border p-4"
                  role="alert"
                >
                  <p className="text-destructive text-sm font-medium">
                    Pembayaran gagal dimulai
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">{error}</p>
                </div>
              ) : null}

              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={!isPayable || isPending}
                onClick={handlePayNow}
              >
                {isPending ? "Memproses..." : payButtonLabel}
              </Button>

              {checkout.hasPendingPayment ? (
                <p className="text-muted-foreground text-center text-sm">
                  Kamu punya sesi pembayaran yang belum selesai. Lanjutkan untuk
                  menyelesaikannya.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Link
            href={`/gor/${checkout.venueSlug}`}
            className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
          >
            Kembali ke GOR
          </Link>
        </div>
      </main>
    </div>
  );
}
