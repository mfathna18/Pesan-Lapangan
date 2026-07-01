"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { CheckoutStatusBanner } from "@/components/checkout/checkout-state-panels";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicCheckoutStatusAction } from "@/domains/payment/actions/get-public-checkout-status.action";
import { PAYMENT_STATUS } from "@/domains/payment/constants";
import type { PublicCheckoutData } from "@/domains/payment/types";
import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 3000;

type CheckoutPaymentWaitingPollerProps = {
  gorSlug: string;
  bookingId: string;
  initialCheckout: PublicCheckoutData;
};

export function CheckoutPaymentWaitingPoller({
  gorSlug,
  bookingId,
  initialCheckout,
}: CheckoutPaymentWaitingPollerProps) {
  const router = useRouter();
  const [checkout, setCheckout] = useState(initialCheckout);

  const successHref = `/gor/${gorSlug}/checkout/${bookingId}/success`;
  const checkoutHref = `/gor/${gorSlug}/checkout/${bookingId}`;

  const handleCheckoutUpdate = useCallback(
    (nextCheckout: PublicCheckoutData) => {
      setCheckout(nextCheckout);

      if (nextCheckout.hasPaidPayment || nextCheckout.status === "CONFIRMED") {
        router.replace(successHref);
        return;
      }

      if (
        nextCheckout.status === "CANCELLED" ||
        nextCheckout.latestPaymentStatus === PAYMENT_STATUS.EXPIRED
      ) {
        router.replace(checkoutHref);
        return;
      }
    },
    [checkoutHref, router, successHref],
  );

  useEffect(() => {
    if (
      checkout.hasPaidPayment ||
      checkout.status === "CONFIRMED" ||
      checkout.status === "CANCELLED" ||
      checkout.latestPaymentStatus === PAYMENT_STATUS.EXPIRED
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void (async () => {
        const response = await getPublicCheckoutStatusAction({
          gorSlug,
          bookingId,
        });

        if (response.success) {
          handleCheckoutUpdate(response.data);
        }
      })();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    bookingId,
    checkout.hasPaidPayment,
    checkout.latestPaymentStatus,
    checkout.status,
    gorSlug,
    handleCheckoutUpdate,
  ]);

  const isFailed =
    checkout.latestPaymentStatus === PAYMENT_STATUS.FAILED &&
    !checkout.hasPaidPayment;

  return (
    <>
      <CheckoutStatusBanner
        label="Menunggu Pembayaran"
        description="Kami memeriksa status pembayaranmu secara otomatis."
      />

      {isFailed ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive text-lg">
              Pembayaran Gagal
            </CardTitle>
            <CardDescription>
              Transaksi tidak berhasil. Kamu bisa mencoba pembayaran lagi dari
              halaman checkout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={checkoutHref} className={cn(buttonVariants(), "w-fit")}>
              Coba Bayar Lagi
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{checkout.bookingNumber}</CardTitle>
            <Badge variant="pending">Menunggu</Badge>
          </div>
          <CardDescription>
            Simpan nomor booking ini sambil menunggu konfirmasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="text-xl font-semibold">
              {formatCurrency(checkout.totalPrice)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={checkoutHref} className={cn(buttonVariants(), "flex-1")}>
          Lanjutkan Pembayaran
        </Link>
        <Link
          href={`/gor/${checkout.venueSlug}`}
          className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
        >
          Kembali ke GOR
        </Link>
      </div>
    </>
  );
}
