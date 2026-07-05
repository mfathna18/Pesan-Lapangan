"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { BookingExpirationCountdown } from "@/components/checkout/booking-expiration-countdown";
import { CheckoutStatusBanner } from "@/components/checkout/checkout-state-panels";
import { CustomerCheckoutBrowserNotifier } from "@/components/pwa/customer-browser-notification-listener";
import { CustomerDetailField } from "@/components/customer/customer-detail-field";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { POLL_INTERVALS } from "@/config/polling-intervals";
import { getPublicCheckoutStatusAction } from "@/domains/payment/actions/get-public-checkout-status.action";
import { PAYMENT_STATUS } from "@/domains/payment/constants";
import type { PublicCheckoutData } from "@/domains/payment/types";
import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { customerLayout } from "@/lib/customer-layout";
import { cn } from "@/lib/utils";
import { usePolling } from "@/hooks/use-polling";

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

  useEffect(() => {
    setCheckout(initialCheckout);
  }, [initialCheckout]);

  const checkoutHref = `/gor/${gorSlug}/checkout/${bookingId}`;
  const invoiceHref = `/gor/${gorSlug}/checkout/${bookingId}/invoice`;

  const handleCheckoutUpdate = useCallback(
    (nextCheckout: PublicCheckoutData) => {
      setCheckout(nextCheckout);

      if (nextCheckout.hasPaidPayment || nextCheckout.status === "CONFIRMED") {
        router.replace(invoiceHref);
        return;
      }

      if (nextCheckout.latestPaymentStatus === PAYMENT_STATUS.REJECTED) {
        router.replace(checkoutHref);
        return;
      }

      if (
        nextCheckout.status === "CANCELLED" ||
        nextCheckout.latestPaymentStatus === PAYMENT_STATUS.EXPIRED
      ) {
        router.replace(checkoutHref);
      }
    },
    [checkoutHref, invoiceHref, router],
  );

  const refreshCheckoutStatus = useCallback(async () => {
    const response = await getPublicCheckoutStatusAction({
      gorSlug,
      bookingId,
    });

    if (response.success) {
      handleCheckoutUpdate(response.data);
    }
  }, [bookingId, gorSlug, handleCheckoutUpdate]);

  const shouldPoll =
    !checkout.hasPaidPayment &&
    checkout.status !== "CONFIRMED" &&
    checkout.status !== "CANCELLED" &&
    checkout.latestPaymentStatus !== PAYMENT_STATUS.EXPIRED &&
    checkout.latestPaymentStatus !== PAYMENT_STATUS.REJECTED;

  usePolling(
    refreshCheckoutStatus,
    POLL_INTERVALS.CHECKOUT_STATUS_MS,
    shouldPoll,
  );

  const isFailed =
    checkout.latestPaymentStatus === PAYMENT_STATUS.FAILED &&
    !checkout.hasPaidPayment;

  return (
    <div className={customerLayout.funnelStack}>
      <CustomerCheckoutBrowserNotifier
        gorSlug={gorSlug}
        bookingId={bookingId}
        latestPaymentStatus={checkout.latestPaymentStatus}
        bookingStatus={checkout.status}
      />
      <CheckoutStatusBanner
        label="Menunggu Pembayaran"
        description={CUSTOMER_COPY.checkout.waitingBanner}
      />

      <BookingExpirationCountdown
        expiresAt={checkout.expiresAt}
        onExpired={() => router.replace(checkoutHref)}
      />

      {isFailed ? (
        <section className="border-destructive/30 bg-destructive/5 space-y-4 rounded-[var(--radius-card-lg)] border p-6">
          <div className="space-y-2">
            <h2 className="text-destructive text-lg font-semibold">
              {CUSTOMER_COPY.checkout.failedTitle}
            </h2>
            <p className="text-muted-foreground text-sm">
              {CUSTOMER_COPY.checkout.failedDescription}
            </p>
          </div>
          <Link href={checkoutHref} className={cn(buttonVariants(), "w-fit")}>
            {CUSTOMER_COPY.checkout.retryPay}
          </Link>
        </section>
      ) : null}

      <section className={customerLayout.checkoutSection}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {CUSTOMER_COPY.checkout.summaryTitle}
            </h2>
            <p className="text-muted-foreground text-sm">
              {checkout.bookingNumber}
            </p>
          </div>
          <Badge variant="pending">Menunggu</Badge>
        </div>

        <p className="text-muted-foreground text-sm">
          Simpan nomor booking ini sambil menunggu konfirmasi pembayaran.
        </p>

        <div className={customerLayout.detailGrid}>
          <CustomerDetailField label="Venue" value={checkout.venueName} />
          <CustomerDetailField label="Lapangan" value={checkout.courtName} />
          <CustomerDetailField
            label="Tanggal"
            value={formatBookingDate(checkout.bookingDate)}
          />
          <CustomerDetailField
            label="Waktu"
            value={formatTimeRange(checkout.startMinute, checkout.endMinute)}
          />
          <CustomerDetailField
            label={CUSTOMER_COPY.checkout.totalLabel}
            value={formatCurrency(checkout.totalPrice)}
            emphasis
            className="sm:col-span-2"
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={checkoutHref}
          className={cn(buttonVariants({ size: "lg" }), "flex-1")}
        >
          {CUSTOMER_COPY.checkout.continuePay}
        </Link>
        <Link
          href={`/gor/${checkout.venueSlug}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "flex-1",
          )}
        >
          {CUSTOMER_COPY.checkout.backToVenue}
        </Link>
      </div>
    </div>
  );
}
