import type { AvailabilitySlot } from "@/domains/availability/types";
import { BOOKING_CUTOFF_MINUTES } from "@/domains/booking/constants";
import {
  getMinimumBookableStartMinute,
  isVenueBookingDateToday,
} from "@/domains/booking/utils/booking-cutoff";
import { GOR_DEFAULT_TIMEZONE } from "@/domains/owner/constants";

export function applyBookingCutoffToSlots(
  slots: AvailabilitySlot[],
  options: {
    bookingDate: Date;
    timezone?: string;
    now?: Date;
    cutoffMinutes?: number;
  },
): AvailabilitySlot[] {
  const timezone = options.timezone ?? GOR_DEFAULT_TIMEZONE;
  const now = options.now ?? new Date();
  const cutoffMinutes = options.cutoffMinutes ?? BOOKING_CUTOFF_MINUTES;

  if (!isVenueBookingDateToday(options.bookingDate, now, timezone)) {
    return slots;
  }

  const minimumStartMinute = getMinimumBookableStartMinute(
    now,
    timezone,
    cutoffMinutes,
  );

  return slots.map((slot) => {
    if (!slot.available) {
      return {
        ...slot,
        unavailableReason: slot.unavailableReason ?? "booked",
      };
    }

    if (slot.startMinute < minimumStartMinute) {
      return {
        ...slot,
        available: false,
        unavailableReason: "past_cutoff",
      };
    }

    return slot;
  });
}
