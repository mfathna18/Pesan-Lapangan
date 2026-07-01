"use client";

import Link from "next/link";
import { X } from "lucide-react";

import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/booking-status-badges";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingDetail } from "@/domains/booking/types";
import {
  formatBookingDate,
  formatCurrency,
  formatDateTime,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { UI_COPY } from "@/config/ui-copy";
import { cn } from "@/lib/utils";

type BookingDetailPanelProps = {
  booking: BookingDetail | null;
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function BookingDetailPanel({
  booking,
  open,
  loading,
  error,
  onClose,
}: BookingDetailPanelProps) {
  return (
    <>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "bg-background border-border fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="border-border flex h-16 items-center justify-between border-b px-4">
          <div>
            <p className="text-sm font-semibold">Detail Booking</p>
            <p className="text-muted-foreground text-xs">
              {booking?.bookingNumber ?? "Pilih booking"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Tutup panel detail"
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-muted-foreground text-sm">{UI_COPY.loading}</p>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          {booking ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Booking</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <DetailField
                    label="Nomor Booking"
                    value={booking.bookingNumber}
                  />
                  <DetailField
                    label="Tanggal Booking"
                    value={formatBookingDate(booking.bookingDate)}
                  />
                  <DetailField
                    label="Jam"
                    value={formatTimeRange(
                      booking.startMinute,
                      booking.endMinute,
                    )}
                  />
                  <DetailField
                    label={UI_COPY.court}
                    value={booking.courtNameSnapshot}
                  />
                  <DetailField label="GOR" value={booking.gorNameSnapshot} />
                  <DetailField
                    label="Olahraga"
                    value={booking.sportTypeSnapshot}
                  />
                  <DetailField
                    label="Total Harga"
                    value={formatCurrency(booking.totalPrice)}
                  />
                  <DetailField
                    label={UI_COPY.status}
                    value={<BookingStatusBadge status={booking.status} />}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pelanggan</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {booking.contact ? (
                    <>
                      <DetailField
                        label="Nama Pelanggan"
                        value={booking.contact.customerName}
                      />
                      <DetailField
                        label="Telepon"
                        value={booking.contact.customerPhone}
                      />
                      <DetailField
                        label="Catatan"
                        value={booking.contact.note ?? "-"}
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Informasi pelanggan belum tersedia.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {booking.payment ? (
                    <>
                      <DetailField
                        label="Jumlah"
                        value={formatCurrency(booking.payment.amount)}
                      />
                      <DetailField
                        label="Metode"
                        value={booking.payment.method}
                      />
                      <DetailField
                        label={UI_COPY.status}
                        value={
                          <PaymentStatusBadge
                            status={
                              booking.payment.status === "PAID"
                                ? "PAID"
                                : booking.payment.status === "EXPIRED"
                                  ? "EXPIRED"
                                  : booking.payment.status === "PENDING"
                                    ? "PENDING"
                                    : booking.payment.status === "FAILED"
                                      ? "FAILED"
                                      : booking.payment.status === "REFUNDED"
                                        ? "REFUNDED"
                                        : "NONE"
                            }
                          />
                        }
                      />
                      <DetailField
                        label="Referensi"
                        value={booking.payment.externalReference ?? "-"}
                      />
                      <DetailField
                        label="Dibayar pada"
                        value={formatDateTime(booking.payment.paidAt)}
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Belum ada pembayaran tercatat untuk booking ini.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informasi Invoice</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {booking.invoice ? (
                    <>
                      <DetailField
                        label="Jam Booking"
                        value={formatTimeRange(
                          booking.startMinute,
                          booking.endMinute,
                        )}
                      />
                      <DetailField
                        label="Nomor Invoice"
                        value={booking.invoice.invoiceNumber}
                      />
                      <DetailField
                        label={UI_COPY.status}
                        value={booking.invoice.status}
                      />
                      <DetailField
                        label="Jumlah"
                        value={formatCurrency(
                          booking.invoice.totalAmountSnapshot,
                        )}
                      />
                      <DetailField
                        label="Dibuat pada"
                        value={formatDateTime(booking.invoice.generatedAt)}
                      />
                      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                        <a
                          href={`/dashboard/invoices/${booking.invoice.id}/pdf`}
                          className={cn(
                            buttonVariants({ size: "sm" }),
                            "w-fit",
                          )}
                        >
                          {UI_COPY.downloadPdf}
                        </a>
                        <Link
                          href="/dashboard/invoices"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "w-fit",
                          )}
                        >
                          Buka Invoice
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Belum ada invoice yang dibuat untuk booking ini.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
