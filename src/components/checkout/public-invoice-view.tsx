import Link from "next/link";
import { Download } from "lucide-react";

import { CustomerDetailField } from "@/components/customer/customer-detail-field";
import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import type { PublicInvoiceData } from "@/domains/invoice/types";
import { getDurationMinutesFromSnapshot } from "@/domains/invoice/utils/invoice-display";
import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { customerLayout } from "@/lib/customer-layout";
import { cn } from "@/lib/utils";

type PublicInvoiceViewProps = {
  invoice: PublicInvoiceData;
};

function formatGeneratedAt(generatedAt: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(generatedAt));
}

export function PublicInvoiceView({ invoice }: PublicInvoiceViewProps) {
  const successHref = `/gor/${invoice.venueSlug}/checkout/${invoice.bookingId}/success`;
  const pdfHref = `/gor/${invoice.venueSlug}/checkout/${invoice.bookingId}/invoice/pdf`;
  const durationMinutes = getDurationMinutesFromSnapshot(
    invoice.startMinute,
    invoice.endMinute,
  );

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader
        gorSlug={invoice.venueSlug}
        gorName={invoice.venueName}
      />
      <main className={customerLayout.page}>
        <div
          className={`${customerLayout.container} ${customerLayout.funnelStack}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
                {CUSTOMER_COPY.invoice.eyebrow}
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {invoice.invoiceNumber}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {CUSTOMER_COPY.invoice.issuedAt(
                  formatGeneratedAt(invoice.generatedAt),
                )}
              </p>
              <Badge variant="paid">Lunas</Badge>
            </div>
            <a
              href={pdfHref}
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              <Download className="size-4" />
              {CUSTOMER_COPY.invoice.downloadPdf}
            </a>
          </div>

          <section className={customerLayout.checkoutSection}>
            <h2 className="text-lg font-semibold tracking-tight">
              {CUSTOMER_COPY.invoice.summaryTitle}
            </h2>
            <div className={customerLayout.detailGrid}>
              <CustomerDetailField
                label="Nomor Invoice"
                value={invoice.invoiceNumber}
              />
              <CustomerDetailField
                label="Nomor Booking"
                value={invoice.bookingNumber}
              />
            </div>
          </section>

          <section className={customerLayout.checkoutSection}>
            <h2 className="text-lg font-semibold tracking-tight">
              {CUSTOMER_COPY.invoice.customerTitle}
            </h2>
            <div className={customerLayout.detailGrid}>
              <CustomerDetailField label="Nama" value={invoice.customerName} />
              <CustomerDetailField
                label="Telepon"
                value={invoice.customerPhone}
              />
            </div>
          </section>

          <section className={customerLayout.checkoutSection}>
            <h2 className="text-lg font-semibold tracking-tight">
              {CUSTOMER_COPY.invoice.bookingTitle}
            </h2>
            <div className={customerLayout.detailGrid}>
              <CustomerDetailField
                label="Tanggal Main"
                value={formatBookingDate(invoice.bookingDate)}
              />
              <CustomerDetailField
                label="Waktu"
                value={formatTimeRange(invoice.startMinute, invoice.endMinute)}
              />
              <CustomerDetailField
                label="Durasi"
                value={`${durationMinutes} menit`}
              />
              <CustomerDetailField label="Lapangan" value={invoice.courtName} />
            </div>
          </section>

          <section className={customerLayout.checkoutSection}>
            <h2 className="text-lg font-semibold tracking-tight">
              {CUSTOMER_COPY.invoice.venueTitle}
            </h2>
            <div className={customerLayout.detailGrid}>
              <CustomerDetailField label="Venue" value={invoice.venueName} />
            </div>
          </section>

          <section className={customerLayout.checkoutSection}>
            <h2 className="text-lg font-semibold tracking-tight">
              {CUSTOMER_COPY.invoice.paymentTitle}
            </h2>
            <CustomerDetailField
              label="Total Dibayar"
              value={formatCurrency(invoice.totalAmount)}
              emphasis
            />
          </section>

          <Link
            href={successHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-fit",
            )}
          >
            {CUSTOMER_COPY.invoice.backToSuccess}
          </Link>
        </div>
      </main>
    </div>
  );
}
