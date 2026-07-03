"use client";

import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import type { BookingRangeLineItem } from "@/domains/booking/utils/booking-range";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { cn } from "@/lib/utils";

type BookingRangeSummaryProps = {
  courtName: string;
  bookingDateLabel?: string;
  startMinute: number | null;
  endMinute: number | null;
  lineItems: BookingRangeLineItem[] | null;
  totalPrice: number | null;
  className?: string;
};

function formatHourCount(durationMinute: number): string {
  const hours = durationMinute / 60;

  return hours === 1 ? "1 Jam" : `${hours} Jam`;
}

export function BookingRangeSummary({
  courtName,
  bookingDateLabel,
  startMinute,
  endMinute,
  lineItems,
  totalPrice,
  className,
}: BookingRangeSummaryProps) {
  const hasCompleteRange =
    startMinute !== null &&
    endMinute !== null &&
    lineItems !== null &&
    totalPrice !== null;
  const durationMinute =
    startMinute !== null && endMinute !== null ? endMinute - startMinute : null;

  return (
    <div
      className={cn(
        "border-border bg-muted/20 rounded-xl border p-5",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-lg font-semibold tracking-tight">{courtName}</p>
        {bookingDateLabel ? (
          <p className="text-muted-foreground text-sm">{bookingDateLabel}</p>
        ) : null}
      </div>

      {!hasCompleteRange ? (
        <p className="text-muted-foreground mt-4 text-sm">
          {CUSTOMER_COPY.booking.rangeEmpty}
        </p>
      ) : null}

      {hasCompleteRange && durationMinute !== null ? (
        <div className="mt-4 space-y-4">
          <div className="space-y-1">
            <p className="text-xl font-semibold tabular-nums">
              {formatTimeRange(startMinute, endMinute)}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatHourCount(durationMinute)}
            </p>
          </div>

          <div className="space-y-2">
            {lineItems.map((item) => (
              <div
                key={`${item.startMinute}-${item.endMinute}`}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-muted-foreground tabular-nums">
                  {formatTimeRange(item.startMinute, item.endMinute)}
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(item.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-border border-t pt-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function formatBookingDateLabel(bookingDate: string): string {
  return formatBookingDate(new Date(`${bookingDate}T00:00:00`));
}
