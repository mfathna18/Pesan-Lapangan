import {
  BOOKING_AWAITING_CONFIRMATION_EXPIRY_HOURS,
  BOOKING_MANUAL_PAYMENT_EXPIRY_HOURS,
} from "@/domains/booking/constants";
import type { BookingStatus, Prisma } from "@/generated/prisma/client";

export function resolveBookingExpiresAt(from: Date): Date {
  return new Date(
    from.getTime() + BOOKING_MANUAL_PAYMENT_EXPIRY_HOURS * 60 * 60 * 1000,
  );
}

export function resolveAwaitingConfirmationExpiresAt(from: Date): Date {
  return new Date(
    from.getTime() +
      BOOKING_AWAITING_CONFIRMATION_EXPIRY_HOURS * 60 * 60 * 1000,
  );
}

export function isBookingSlotHoldActive(
  status: BookingStatus,
  expiresAt: Date,
  referenceDate: Date = new Date(),
): boolean {
  if (status === "CONFIRMED") {
    return true;
  }

  if (status === "PENDING") {
    return expiresAt.getTime() >= referenceDate.getTime();
  }

  return false;
}

export function buildAvailabilityBlockingBookingWhere(
  referenceDate: Date = new Date(),
): Pick<Prisma.BookingWhereInput, "OR"> {
  return {
    OR: [
      { status: "CONFIRMED" },
      {
        status: "PENDING",
        expiresAt: {
          gte: referenceDate,
        },
      },
    ],
  };
}
