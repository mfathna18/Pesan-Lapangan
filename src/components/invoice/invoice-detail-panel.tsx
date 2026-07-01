"use client";

import Link from "next/link";
import { Download, X } from "lucide-react";

import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OwnerInvoiceDetail } from "@/domains/invoice/types";
import {
  formatBookingDate,
  formatCurrency,
  formatDateTime,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { getDurationMinutesFromSnapshot } from "@/domains/invoice/utils/invoice-display";
import { cn } from "@/lib/utils";

type InvoiceDetailPanelProps = {
  open: boolean;
  detail: OwnerInvoiceDetail | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export function InvoiceDetailPanel({
  open,
  detail,
  isLoading,
  error,
  onClose,
}: InvoiceDetailPanelProps) {
  if (!open) {
    return null;
  }

  const pdfHref = detail ? `/dashboard/invoices/${detail.id}/pdf` : "#";
  const durationMinutes = detail
    ? getDurationMinutesFromSnapshot(detail.startMinute, detail.endMinute)
    : 0;

  return (
    <>
      <button
        type="button"
        aria-label="Tutup detail invoice"
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      <aside className="border-border bg-background fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              Detail Invoice
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              {detail?.invoiceNumber ?? "Memuat..."}
            </h2>
            {detail ? (
              <InvoiceStatusBadge
                invoiceStatus={detail.status}
                paymentStatus={detail.paymentStatus}
              />
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Memuat invoice...</p>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          {detail ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label="Nomor Invoice"
                    value={detail.invoiceNumber}
                  />
                  <DetailField
                    label="Nomor Booking"
                    value={detail.bookingNumber}
                  />
                  <DetailField label="Pelanggan" value={detail.customerName} />
                  <DetailField label="Telepon" value={detail.customerPhone} />
                  <DetailField
                    label="Diterbitkan"
                    value={formatDateTime(detail.generatedAt)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detail Booking</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <DetailField label="GOR" value={detail.venueName} />
                  <DetailField label="Lapangan" value={detail.courtName} />
                  <DetailField
                    label="Tanggal Main"
                    value={formatBookingDate(detail.bookingDate)}
                  />
                  <DetailField
                    label="Waktu"
                    value={formatTimeRange(
                      detail.startMinute,
                      detail.endMinute,
                    )}
                  />
                  <DetailField
                    label="Durasi"
                    value={`${durationMinutes} menit`}
                  />
                  <DetailField
                    label="Total"
                    value={formatCurrency(detail.totalAmount)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label="Metode Pembayaran"
                    value={detail.paymentMethod}
                  />
                  <DetailField
                    label="Referensi"
                    value={detail.paymentReference ?? "-"}
                  />
                  <DetailField
                    label="Tanggal Bayar"
                    value={detail.paidAt ? formatDateTime(detail.paidAt) : "-"}
                  />
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        {detail ? (
          <div className="border-t px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={pdfHref}
                className={cn(buttonVariants(), "flex-1 sm:flex-none")}
              >
                <Download className="size-4" />
                Unduh PDF
              </a>
              <Link
                href={`/dashboard/bookings?bookingId=${detail.bookingId}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "flex-1 sm:flex-none",
                )}
              >
                Buka Booking
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
