import { BOOKING_DURATION_INTERVAL_MINUTES } from "@/domains/booking/constants";
import { BookingValidationError } from "@/domains/booking/errors";
import type {
  AvailabilitySlot,
  TimeInterval,
} from "@/domains/availability/types";

const MINUTES_PER_DAY = 1440;

export function buildHourlyIntervals(
  startMinute: number,
  endMinute: number,
): TimeInterval[] {
  const intervals: TimeInterval[] = [];

  for (
    let cursor = startMinute;
    cursor < endMinute;
    cursor += BOOKING_DURATION_INTERVAL_MINUTES
  ) {
    intervals.push({
      startMinute: cursor,
      endMinute: cursor + BOOKING_DURATION_INTERVAL_MINUTES,
    });
  }

  return intervals;
}

export function validateBookingRangeMinutes(
  startMinute: number,
  endMinute: number,
): { durationMinute: number } {
  if (!Number.isInteger(startMinute) || startMinute < 0) {
    throw new BookingValidationError(
      "Start minute must be a non-negative integer.",
    );
  }

  if (!Number.isInteger(endMinute) || endMinute <= startMinute) {
    throw new BookingValidationError("End time must be after start time.");
  }

  const durationMinute = endMinute - startMinute;

  if (durationMinute % BOOKING_DURATION_INTERVAL_MINUTES !== 0) {
    throw new BookingValidationError(
      `Booking range must use ${BOOKING_DURATION_INTERVAL_MINUTES}-minute intervals.`,
    );
  }

  if (endMinute > MINUTES_PER_DAY) {
    throw new BookingValidationError("Booking time exceeds the day boundary.");
  }

  return { durationMinute };
}

export function resolveRangeTotalPrice(
  slots: readonly AvailabilitySlot[],
  startMinute: number,
  endMinute: number,
): number | null {
  const lineItems = resolveRangeLineItems(slots, startMinute, endMinute);

  if (!lineItems) {
    return null;
  }

  return lineItems.reduce((total, item) => total + item.price, 0);
}

export type BookingRangeLineItem = {
  startMinute: number;
  endMinute: number;
  price: number;
};

export function resolveRangeLineItems(
  slots: readonly AvailabilitySlot[],
  startMinute: number,
  endMinute: number,
): BookingRangeLineItem[] | null {
  validateBookingRangeMinutes(startMinute, endMinute);

  const intervals = buildHourlyIntervals(startMinute, endMinute);
  const lineItems: BookingRangeLineItem[] = [];

  for (const interval of intervals) {
    const slot = slots.find(
      (candidate) =>
        candidate.startMinute === interval.startMinute &&
        candidate.endMinute === interval.endMinute,
    );

    if (!slot || !slot.available) {
      return null;
    }

    lineItems.push({
      startMinute: slot.startMinute,
      endMinute: slot.endMinute,
      price: slot.price,
    });
  }

  return lineItems;
}

export function isSlotWithinBookingRange(
  slot: Pick<AvailabilitySlot, "startMinute" | "endMinute">,
  rangeStartMinute: number,
  rangeEndMinute: number,
): boolean {
  return (
    slot.startMinute >= rangeStartMinute && slot.endMinute <= rangeEndMinute
  );
}
