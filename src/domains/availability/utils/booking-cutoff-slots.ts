import type { AvailabilitySlot } from "@/domains/availability/types";
import { isBookingSlotExpired } from "@/domains/booking/utils/booking-cutoff";
import { GOR_DEFAULT_TIMEZONE } from "@/domains/owner/constants";

export function applyBookingCutoffToSlots(
  slots: AvailabilitySlot[],
  options: {
    bookingDate: Date;
    timezone?: string;
    now?: Date;
  },
): AvailabilitySlot[] {
  const timezone = options.timezone ?? GOR_DEFAULT_TIMEZONE;
  const now = options.now ?? new Date();

  return slots.map((slot) => {
    if (!slot.available) {
      return {
        ...slot,
        unavailableReason: slot.unavailableReason ?? "booked",
      };
    }

    if (
      isBookingSlotExpired({
        bookingDate: options.bookingDate,
        endMinute: slot.endMinute,
        now,
        timezone,
      })
    ) {
      return {
        ...slot,
        available: false,
        unavailableReason: "past_cutoff",
      };
    }

    return slot;
  });
}
