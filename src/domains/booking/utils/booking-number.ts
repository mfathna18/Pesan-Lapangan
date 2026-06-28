import {
  BOOKING_DURATION_INTERVAL_MINUTES,
  BOOKING_NUMBER_PREFIX,
  BOOKING_NUMBER_SEQUENCE_LENGTH,
} from "@/domains/booking/constants";
import { BookingValidationError } from "@/domains/booking/errors";
import type { BookingRepository } from "@/domains/booking/repositories/booking-repository";

function formatBookingDatePart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

export async function generateBookingNumber(
  bookingDate: Date,
  bookingRepository: BookingRepository,
): Promise<string> {
  const datePart = formatBookingDatePart(bookingDate);
  const prefix = `${BOOKING_NUMBER_PREFIX}-${datePart}-`;
  const maxSequence = 10 ** BOOKING_NUMBER_SEQUENCE_LENGTH;

  for (let sequence = 1; sequence < maxSequence; sequence += 1) {
    const bookingNumber = `${prefix}${String(sequence).padStart(BOOKING_NUMBER_SEQUENCE_LENGTH, "0")}`;
    const existing = await bookingRepository.findByBookingNumber(bookingNumber);

    if (!existing) {
      return bookingNumber;
    }
  }

  throw new BookingValidationError(
    "Unable to generate a unique booking number.",
  );
}

export function calculateEndMinute(
  startMinute: number,
  durationMinute: number,
): number {
  return startMinute + durationMinute;
}

export { BOOKING_DURATION_INTERVAL_MINUTES };
