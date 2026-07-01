"use client";

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
  emptyMessage = "Tidak ada slot untuk tanggal ini.",
}: AvailabilitySlotGridProps) {
  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Memuat ketersediaan...</p>
    );
  }

  if (slots.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
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
              "rounded-xl border p-4 text-left transition-colors",
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
