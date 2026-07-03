import Link from "next/link";
import { CheckCircle2, Share2 } from "lucide-react";

import { CustomerDetailField } from "@/components/customer/customer-detail-field";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { PAYMENT_METHOD_LABELS } from "@/domains/payment/constants";
import type { PublicCheckoutData } from "@/domains/payment/types";
import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { customerLayout } from "@/lib/customer-layout";
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

function getPaymentMethodLabel(checkout: PublicCheckoutData): string {
  if (checkout.paymentSummary) {
    const label = PAYMENT_METHOD_LABELS[checkout.paymentSummary.method];
    return label === "Midtrans"
      ? CUSTOMER_COPY.success.paymentMethodFallback
      : label;
  }

  return CUSTOMER_COPY.success.paymentMethodFallback;
}

export function CheckoutSuccessDetails({
  checkout,
}: CheckoutSuccessDetailsProps) {
  const invoiceHref = `/gor/${checkout.venueSlug}/checkout/${checkout.bookingId}/invoice`;
  const paymentSummary = checkout.paymentSummary;

  return (
    <div className={customerLayout.funnelStack}>
      <section className="border-success/25 bg-success/10 rounded-[var(--radius-card-lg)] border px-6 py-10 text-center sm:px-10 sm:py-12">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="bg-success/15 text-success flex size-16 items-center justify-center rounded-full">
            <CheckCircle2 className="size-9" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {CUSTOMER_COPY.success.title}
            </h1>
            <p className="text-muted-foreground text-base">
              {CUSTOMER_COPY.success.subtitle}
            </p>
          </div>
          <Badge variant="confirmed">
            {CUSTOMER_COPY.success.statusConfirmed}
          </Badge>
        </div>
      </section>

      <section className={customerLayout.checkoutSection} id="booking">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {CUSTOMER_COPY.success.detailsTitle}
          </h2>
          <Badge variant="confirmed">
            {CUSTOMER_COPY.success.statusConfirmed}
          </Badge>
        </div>
        <div className={customerLayout.detailGrid}>
          <CustomerDetailField
            label="Nomor Booking"
            value={checkout.bookingNumber}
          />
          <CustomerDetailField
            label="Pelanggan"
            value={checkout.customerName}
          />
          <CustomerDetailField label="Telepon" value={checkout.customerPhone} />
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
            label="Durasi"
            value={`${checkout.durationMinute} menit`}
          />
        </div>
      </section>

      <section className={customerLayout.checkoutSection}>
        <h2 className="text-lg font-semibold tracking-tight">
          {CUSTOMER_COPY.success.paymentTitle}
        </h2>
        <div className={customerLayout.detailGrid}>
          <CustomerDetailField
            label="Status"
            value={CUSTOMER_COPY.success.statusPaid}
          />
          <CustomerDetailField
            label="Metode"
            value={getPaymentMethodLabel(checkout)}
          />
          <CustomerDetailField
            label="Waktu Bayar"
            value={formatPaidAt(paymentSummary?.paidAt ?? null)}
          />
          <CustomerDetailField
            label="Total Dibayar"
            value={formatCurrency(
              paymentSummary?.amount ?? checkout.totalPrice,
            )}
            emphasis
          />
        </div>
      </section>

      <section className={customerLayout.checkoutSection} id="invoice">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {CUSTOMER_COPY.success.invoiceTitle}
          </h2>
          <p className="text-muted-foreground text-sm">
            {checkout.invoiceNumber
              ? CUSTOMER_COPY.success.invoiceReady
              : CUSTOMER_COPY.success.invoicePending}
          </p>
        </div>

        {checkout.invoiceNumber ? (
          <p className="text-xl font-semibold tracking-tight">
            {checkout.invoiceNumber}
          </p>
        ) : (
          <div className="space-y-2" aria-busy="true" aria-live="polite">
            <span className="sr-only">
              {CUSTOMER_COPY.success.invoiceWaiting}
            </span>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href="#booking"
            className={cn(
              buttonVariants({ size: "lg" }),
              "flex-1 sm:flex-none",
            )}
          >
            {CUSTOMER_COPY.success.viewDetails}
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
                {CUSTOMER_COPY.success.viewInvoice}
              </Link>
              <a
                href={`${invoiceHref}/pdf`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "flex-1 sm:flex-none",
                )}
              >
                {CUSTOMER_COPY.success.downloadPdf}
              </a>
            </>
          ) : null}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/gor/${checkout.venueSlug}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "flex-1 sm:flex-none",
          )}
        >
          {CUSTOMER_COPY.success.backToVenue}
        </Link>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled
          className="flex-1 sm:flex-none"
          title={CUSTOMER_COPY.success.shareHint}
        >
          <Share2 className="size-4" />
          {CUSTOMER_COPY.success.sharePlaceholder}
        </Button>
      </div>
    </div>
  );
}
