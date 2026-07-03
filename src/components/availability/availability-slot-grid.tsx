"use client";

import { CalendarClock } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import {
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import type { AvailabilitySlot } from "@/domains/availability/types";
import { cn } from "@/lib/utils";

type AvailabilitySlotGridProps = {
  slots: AvailabilitySlot[];
  selectedStartMinute?: number | null;
  selectedEndMinute?: number | null;
  isSlotInSelectedRange?: (slot: AvailabilitySlot) => boolean;
  onSelectSlot?: (slot: AvailabilitySlot) => void;
  isLoading?: boolean;
  emptyMessage?: string;
};

export function AvailabilitySlotGrid({
  slots,
  selectedStartMinute = null,
  selectedEndMinute = null,
  isSlotInSelectedRange,
  onSelectSlot,
  isLoading = false,
  emptyMessage = CUSTOMER_COPY.court.noSlotsDescription,
}: AvailabilitySlotGridProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Memuat ketersediaan...</span>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <EmptyState
        variant="plain"
        icon={CalendarClock}
        title={CUSTOMER_COPY.court.noSlotsTitle}
        description={emptyMessage}
      />
    );
  }

  const sortedSlots = [...slots].sort(
    (left, right) => left.startMinute - right.startMinute,
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {sortedSlots.map((slot) => {
        const isStartSelected = selectedStartMinute === slot.startMinute;
        const isEndSelected =
          selectedEndMinute !== null && selectedEndMinute === slot.endMinute;
        const isInRange = isSlotInSelectedRange?.(slot) ?? false;
        const isInteractive = Boolean(onSelectSlot) && slot.available;

        return (
          <button
            key={`${slot.startMinute}-${slot.endMinute}`}
            type="button"
            disabled={!slot.available || !onSelectSlot}
            onClick={() => {
              if (slot.available && onSelectSlot) {
                onSelectSlot(slot);
              }
            }}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors duration-150 motion-reduce:transition-none",
              slot.available
                ? onSelectSlot
                  ? "hover:border-primary/60 hover:bg-muted/40 cursor-pointer"
                  : "bg-background"
                : "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60",
              isInRange && "border-primary/40 bg-primary/5",
              (isStartSelected || isEndSelected) &&
                "border-primary bg-primary/5 ring-primary ring-2",
              !isInteractive && slot.available && "cursor-default",
            )}
          >
            <p className="text-base font-semibold tabular-nums">
              {formatTimeRange(slot.startMinute, slot.endMinute)}
            </p>
            <p className="mt-2 text-sm font-medium">
              {formatCurrency(slot.price)}
            </p>
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                slot.available
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              {isStartSelected && isEndSelected
                ? "Dipilih"
                : isStartSelected
                  ? "Mulai"
                  : isEndSelected
                    ? "Selesai"
                    : slot.available
                      ? "Tersedia"
                      : "Terisi"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
