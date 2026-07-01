import { BookingValidationError } from "@/domains/booking/errors";
import type { CreateBookingRequest } from "@/domains/booking/services/booking-service.types";
import { validateBookingRangeMinutes } from "@/domains/booking/utils/booking-range";

export function validateCreateBookingRequest(input: CreateBookingRequest): {
  endMinute: number;
  durationMinute: number;
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

  const { durationMinute } = validateBookingRangeMinutes(
    input.startMinute,
    input.endMinute,
  );

  if (!input.contact.customerName.trim()) {
    throw new BookingValidationError("Customer name is required.");
  }

  if (!input.contact.customerPhone.trim()) {
    throw new BookingValidationError("Customer phone is required.");
  }

  return {
    endMinute: input.endMinute,
    durationMinute,
    dayOfWeek: input.bookingDate.getDay(),
  };
}
