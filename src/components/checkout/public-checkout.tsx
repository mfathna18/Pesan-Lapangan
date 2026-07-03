"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import {
  BookingExpirationCountdown,
  isCheckoutExpired,
} from "@/components/checkout/booking-expiration-countdown";
import { CheckoutSuccessDetails } from "@/components/checkout/checkout-success-details";
import {
  CheckoutExpiredState,
  CheckoutStatusBanner,
} from "@/components/checkout/checkout-state-panels";
import { ManualPaymentInstructions } from "@/components/checkout/manual-payment-instructions";
import { CustomerDetailField } from "@/components/customer/customer-detail-field";
import { CustomerFunnelHeader } from "@/components/customer/customer-funnel-header";
import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { POLL_INTERVALS } from "@/config/polling-intervals";
import { getPublicCheckoutStatusAction } from "@/domains/payment/actions/get-public-checkout-status.action";
import { PAYMENT_STATUS } from "@/domains/payment/constants";
import {
  cancelManualBookingAction,
  submitManualPaymentConfirmationAction,
} from "@/domains/payment/actions/submit-manual-payment.action";
import type { PublicCheckoutData } from "@/domains/payment/types";
import { CUSTOMER_PAYMENT_STATUS_LABELS } from "@/domains/payment/utils/customer-payment-status";
import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { customerLayout } from "@/lib/customer-layout";
import { cn } from "@/lib/utils";
import { usePolling } from "@/hooks/use-polling";

type PublicCheckoutProps = {
  checkout: PublicCheckoutData;
};

function CheckoutShell({
  checkout,
  children,
}: {
  checkout: PublicCheckoutData;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader
        gorSlug={checkout.venueSlug}
        gorName={checkout.venueName}
      />
      <main className={customerLayout.page}>
        <div
          className={`${customerLayout.container} ${customerLayout.funnelStack}`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export function PublicCheckout({
  checkout: initialCheckout,
}: PublicCheckoutProps) {
  const router = useRouter();
  const [checkout, setCheckout] = useState(initialCheckout);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isExpired, setIsExpired] = useState(() =>
    initialCheckout.latestPaymentStatus === PAYMENT_STATUS.REJECTED
      ? false
      : isCheckoutExpired(initialCheckout.expiresAt, initialCheckout.status),
  );

  useEffect(() => {
    setCheckout(initialCheckout);
  }, [initialCheckout]);

  const handleExpired = useCallback(() => {
    setIsExpired(true);
    setError(null);
  }, []);

  const isPaid = checkout.hasPaidPayment;
  const isAwaitingConfirmation =
    checkout.latestPaymentStatus === PAYMENT_STATUS.AWAITING_CONFIRMATION;
  const isRejected = checkout.latestPaymentStatus === PAYMENT_STATUS.REJECTED;
  const isCancelled = checkout.status === "CANCELLED";
  const statusLabel =
    CUSTOMER_PAYMENT_STATUS_LABELS[
      checkout.customerPaymentStatus as keyof typeof CUSTOMER_PAYMENT_STATUS_LABELS
    ] ?? "Menunggu Pembayaran";

  const isPayable =
    !isExpired &&
    !isCancelled &&
    checkout.status === "PENDING" &&
    !isPaid &&
    !isAwaitingConfirmation &&
    !isRejected &&
    new Date(checkout.expiresAt).getTime() > Date.now();

  const refreshCheckoutStatus = useCallback(async () => {
    const response = await getPublicCheckoutStatusAction({
      gorSlug: checkout.venueSlug,
      bookingId: checkout.bookingId,
    });

    if (!response.success) {
      return;
    }

    const nextCheckout = response.data;
    setCheckout(nextCheckout);

    if (nextCheckout.hasPaidPayment) {
      router.replace(
        `/gor/${nextCheckout.venueSlug}/checkout/${nextCheckout.bookingId}/invoice`,
      );
    }
  }, [checkout.bookingId, checkout.venueSlug, router]);

  usePolling(
    refreshCheckoutStatus,
    POLL_INTERVALS.CHECKOUT_STATUS_MS,
    isAwaitingConfirmation && !isPaid,
  );

  function handleConfirmPaid() {
    setError(null);

    startTransition(async () => {
      const response = await submitManualPaymentConfirmationAction({
        gorSlug: checkout.venueSlug,
        bookingId: checkout.bookingId,
      });

      if (!response.success) {
        setError(response.error);
        return;
      }

      router.refresh();
    });
  }

  function handleCancelBooking() {
    setError(null);

    startTransition(async () => {
      const response = await cancelManualBookingAction({
        gorSlug: checkout.venueSlug,
        bookingId: checkout.bookingId,
      });

      if (!response.success) {
        setError(response.error);
        return;
      }

      router.refresh();
    });
  }

  if (isPaid) {
    return (
      <CheckoutShell checkout={checkout}>
        <CheckoutSuccessDetails checkout={checkout} />
      </CheckoutShell>
    );
  }

  if (isRejected) {
    return (
      <CheckoutShell checkout={checkout}>
        <CustomerFunnelHeader
          eyebrow={CUSTOMER_COPY.checkout.eyebrow}
          title={CUSTOMER_COPY.checkout.rejectedTitle}
          description={
            checkout.rejectionReason ??
            CUSTOMER_COPY.checkout.rejectedDescription
          }
        />
        <CheckoutStatusBanner
          label={statusLabel}
          description={CUSTOMER_COPY.checkout.rejectedBanner}
        />
        <ManualPaymentInstructions
          instructions={checkout.ownerPaymentInstructions}
          totalPrice={checkout.totalPrice}
        />
        <Link
          href={`/gor/${checkout.venueSlug}`}
          className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
        >
          {CUSTOMER_COPY.checkout.backToVenue}
        </Link>
      </CheckoutShell>
    );
  }

  if (isExpired || isCancelled) {
    return (
      <CheckoutShell checkout={checkout}>
        <CheckoutExpiredState
          venueSlug={checkout.venueSlug}
          venueName={checkout.venueName}
        />
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell checkout={checkout}>
      <CustomerFunnelHeader
        eyebrow={CUSTOMER_COPY.checkout.eyebrow}
        title={
          isAwaitingConfirmation
            ? CUSTOMER_COPY.checkout.waitingOwnerTitle
            : CUSTOMER_COPY.checkout.title
        }
        description={
          isAwaitingConfirmation
            ? CUSTOMER_COPY.checkout.waitingOwnerDescription
            : CUSTOMER_COPY.checkout.manualDescription
        }
      />

      <CheckoutStatusBanner
        label={statusLabel}
        description={
          isAwaitingConfirmation
            ? CUSTOMER_COPY.checkout.waitingOwnerBanner
            : CUSTOMER_COPY.checkout.manualBanner
        }
      />

      {!isAwaitingConfirmation ? (
        <BookingExpirationCountdown
          expiresAt={checkout.expiresAt}
          onExpired={handleExpired}
        />
      ) : null}

      <section
        className={customerLayout.checkoutSection}
        aria-labelledby="checkout-summary"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="checkout-summary"
              className="text-lg font-semibold tracking-tight"
            >
              {CUSTOMER_COPY.checkout.summaryTitle}
            </h2>
            <p className="text-muted-foreground text-sm">
              {checkout.bookingNumber}
            </p>
          </div>
          <Badge variant="pending">{statusLabel}</Badge>
        </div>

        <div className={customerLayout.detailGrid}>
          <CustomerDetailField label="Lapangan" value={checkout.courtName} />
          <CustomerDetailField
            label={CUSTOMER_COPY.checkout.venueLabel}
            value={checkout.venueName}
          />
          <CustomerDetailField
            label="Tanggal"
            value={formatBookingDate(checkout.bookingDate)}
          />
          <CustomerDetailField
            label="Waktu"
            value={formatTimeRange(checkout.startMinute, checkout.endMinute)}
          />
          <CustomerDetailField
            label="Durasi"
            value={`${checkout.durationMinute} menit`}
          />
          <CustomerDetailField
            label="Total"
            value={formatCurrency(checkout.totalPrice)}
          />
        </div>
      </section>

      <ManualPaymentInstructions
        instructions={checkout.ownerPaymentInstructions}
        totalPrice={checkout.totalPrice}
      />

      {error ? (
        <div
          className="border-destructive/30 bg-destructive/5 rounded-[var(--radius-card)] border p-4"
          role="alert"
        >
          <p className="text-destructive text-sm font-medium">
            {CUSTOMER_COPY.checkout.payErrorTitle}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">{error}</p>
        </div>
      ) : null}

      {isAwaitingConfirmation ? (
        <Button type="button" size="lg" className="w-full" disabled>
          {CUSTOMER_COPY.checkout.waitingConfirmButton}
        </Button>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={!isPayable || isPending}
            onClick={handleConfirmPaid}
          >
            {isPending
              ? CUSTOMER_COPY.checkout.processing
              : CUSTOMER_COPY.checkout.confirmPaid}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="flex-1"
            disabled={isPending}
            onClick={handleCancelBooking}
          >
            {CUSTOMER_COPY.checkout.cancelBooking}
          </Button>
        </div>
      )}

      <Link
        href={`/gor/${checkout.venueSlug}`}
        className={cn(buttonVariants({ variant: "ghost" }), "w-fit")}
      >
        {CUSTOMER_COPY.checkout.backToVenue}
      </Link>
    </CheckoutShell>
  );
}
