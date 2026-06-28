"use client";

import { X } from "lucide-react";

import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/booking-status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingDetail } from "@/domains/booking/types";
import {
  formatBookingDate,
  formatCurrency,
  formatDateTime,
  formatMinuteOfDay,
} from "@/domains/booking/utils/booking-display";
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
            <p className="text-sm font-semibold">Booking Detail</p>
            <p className="text-muted-foreground text-xs">
              {booking?.bookingNumber ?? "Select a booking"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close detail panel"
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading detail...</p>
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
                  <CardTitle>Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <DetailField
                    label="Booking Number"
                    value={booking.bookingNumber}
                  />
                  <DetailField
                    label="Booking Date"
                    value={formatBookingDate(booking.bookingDate)}
                  />
                  <DetailField
                    label="Time"
                    value={`${formatMinuteOfDay(booking.startMinute)} - ${formatMinuteOfDay(booking.endMinute)}`}
                  />
                  <DetailField
                    label="Court"
                    value={booking.courtNameSnapshot}
                  />
                  <DetailField label="GOR" value={booking.gorNameSnapshot} />
                  <DetailField
                    label="Sport"
                    value={booking.sportTypeSnapshot}
                  />
                  <DetailField
                    label="Total Price"
                    value={formatCurrency(booking.totalPrice)}
                  />
                  <DetailField
                    label="Status"
                    value={<BookingStatusBadge status={booking.status} />}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {booking.contact ? (
                    <>
                      <DetailField
                        label="Customer Name"
                        value={booking.contact.customerName}
                      />
                      <DetailField
                        label="Phone"
                        value={booking.contact.customerPhone}
                      />
                      <DetailField
                        label="Note"
                        value={booking.contact.note ?? "-"}
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No customer information available.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {booking.payment ? (
                    <>
                      <DetailField
                        label="Amount"
                        value={formatCurrency(booking.payment.amount)}
                      />
                      <DetailField
                        label="Method"
                        value={booking.payment.method}
                      />
                      <DetailField
                        label="Status"
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
                        label="Reference"
                        value={booking.payment.externalReference ?? "-"}
                      />
                      <DetailField
                        label="Paid At"
                        value={formatDateTime(booking.payment.paidAt)}
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No payment recorded for this booking.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {booking.invoice ? (
                    <>
                      <DetailField
                        label="Invoice Number"
                        value={booking.invoice.invoiceNumber}
                      />
                      <DetailField
                        label="Status"
                        value={booking.invoice.status}
                      />
                      <DetailField
                        label="Amount"
                        value={formatCurrency(
                          booking.invoice.totalAmountSnapshot,
                        )}
                      />
                      <DetailField
                        label="Generated At"
                        value={formatDateTime(booking.invoice.generatedAt)}
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No invoice generated for this booking.
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
