import type { TimeInterval } from "@/domains/availability/types";
import { intervalsOverlap } from "@/domains/availability/utils/time-interval";
import type { BookingStatus } from "@/generated/prisma/client";

export const BLOCKING_BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
];

export function slotConflictsWithBookings(
  slot: TimeInterval,
  existingBookings: readonly TimeInterval[],
): boolean {
  return existingBookings.some((booking) => intervalsOverlap(slot, booking));
}
