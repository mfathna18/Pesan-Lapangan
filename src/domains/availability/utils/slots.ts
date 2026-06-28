import { BOOKING_INTERVAL_MINUTES } from "@/domains/availability/constants";
import type {
  AvailabilitySlot,
  OperatingHoursWindow,
  PriceRuleWindow,
  TimeInterval,
} from "@/domains/availability/types";
import { resolveSlotPrice } from "@/domains/availability/utils/operating-hours";
import {
  dedupeSlotsByStartMinute,
  generateFixedIntervalSlots,
  intervalsOverlap,
} from "@/domains/availability/utils/time-interval";

export function buildAvailabilitySlots(
  operatingHours: OperatingHoursWindow[],
  priceRules: PriceRuleWindow[],
  existingBookings: TimeInterval[],
): AvailabilitySlot[] {
  const hourlySlots = operatingHours.flatMap((window) =>
    generateFixedIntervalSlots(window, BOOKING_INTERVAL_MINUTES),
  );

  return dedupeSlotsByStartMinute(hourlySlots).flatMap((slot) => {
    const price = resolveSlotPrice(slot, priceRules);

    if (price === null) {
      return [];
    }

    const isBooked = existingBookings.some((booking) =>
      intervalsOverlap(slot, booking),
    );

    if (isBooked) {
      return [];
    }

    return [
      {
        startMinute: slot.startMinute,
        endMinute: slot.endMinute,
        price,
        available: true,
      },
    ];
  });
}
