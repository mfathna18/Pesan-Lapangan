import { BOOKING_DURATION_INTERVAL_MINUTES } from "@/domains/booking/constants";
import { BookingValidationError } from "@/domains/booking/errors";
import type { CreateBookingRequest } from "@/domains/booking/services/booking-service.types";
import { calculateEndMinute } from "@/domains/booking/utils/booking-number";

const MINUTES_PER_DAY = 1440;

export function validateCreateBookingRequest(input: CreateBookingRequest): {
  endMinute: number;
  dayOfWeek: number;
} {
  if (!input.courtId.trim()) {
    throw new BookingValidationError("Court is required.");
  }

  if (
    !(input.bookingDate instanceof Date) ||
    Number.isNaN(input.bookingDate.getTime())
  ) {
    throw new BookingValidationError("Booking date is invalid.");
  }

  if (!Number.isInteger(input.startMinute) || input.startMinute < 0) {
    throw new BookingValidationError(
      "Start minute must be a non-negative integer.",
    );
  }

  if (!Number.isInteger(input.durationMinute) || input.durationMinute <= 0) {
    throw new BookingValidationError("Duration must be a positive integer.");
  }

  if (input.durationMinute !== BOOKING_DURATION_INTERVAL_MINUTES) {
    throw new BookingValidationError(
      `Booking duration must be ${BOOKING_DURATION_INTERVAL_MINUTES} minutes.`,
    );
  }

  const endMinute = calculateEndMinute(input.startMinute, input.durationMinute);

  if (endMinute > MINUTES_PER_DAY) {
    throw new BookingValidationError("Booking time exceeds the day boundary.");
  }

  if (!input.contact.customerName.trim()) {
    throw new BookingValidationError("Customer name is required.");
  }

  if (!input.contact.customerPhone.trim()) {
    throw new BookingValidationError("Customer phone is required.");
  }

  return {
    endMinute,
    dayOfWeek: input.bookingDate.getDay(),
  };
}
