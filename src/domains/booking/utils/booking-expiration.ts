import { BOOKING_PENDING_EXPIRY_MINUTES } from "@/domains/booking/constants";
import type { BookingStatus, Prisma } from "@/generated/prisma/client";

export function resolveBookingExpiresAt(from: Date): Date {
  return new Date(from.getTime() + BOOKING_PENDING_EXPIRY_MINUTES * 60 * 1000);
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
