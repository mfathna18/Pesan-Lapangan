import Link from "next/link";
import { Download } from "lucide-react";

import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicInvoiceData } from "@/domains/invoice/types";
import { getDurationMinutesFromSnapshot } from "@/domains/invoice/utils/invoice-display";
import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
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
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
                Invoice
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {invoice.invoiceNumber}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Diterbitkan {formatGeneratedAt(invoice.generatedAt)}
              </p>
              <Badge variant="paid">Lunas</Badge>
            </div>
            <a
              href={pdfHref}
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              <Download className="size-4" />
              Unduh PDF
            </a>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="Nomor Invoice"
                value={invoice.invoiceNumber}
              />
              <DetailField
                label="Nomor Booking"
                value={invoice.bookingNumber}
              />
              <DetailField label="Pelanggan" value={invoice.customerName} />
              <DetailField label="Telepon" value={invoice.customerPhone} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail Booking</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <DetailField label="GOR" value={invoice.venueName} />
              <DetailField label="Lapangan" value={invoice.courtName} />
              <DetailField
                label="Tanggal Main"
                value={formatBookingDate(invoice.bookingDate)}
              />
              <DetailField
                label="Waktu"
                value={formatTimeRange(invoice.startMinute, invoice.endMinute)}
              />
              <DetailField label="Durasi" value={`${durationMinutes} menit`} />
              <DetailField
                label="Total"
                value={formatCurrency(invoice.totalAmount)}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={successHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "flex-1 sm:flex-none",
              )}
            >
              Kembali ke Konfirmasi
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
