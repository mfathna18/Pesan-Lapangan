import type { PrismaClient } from "@/generated/prisma/client";
import type { TimeInterval } from "@/domains/availability/types";
import { buildAvailabilityBlockingBookingWhere } from "@/domains/booking/utils/booking-expiration";
import { startOfDay } from "@/domains/availability/utils/time-interval";

export type BookingReader = {
  findByCourtAndDate: (courtId: string, date: Date) => Promise<TimeInterval[]>;
};

export function createPrismaBookingReader(prisma: PrismaClient): BookingReader {
  return {
    async findByCourtAndDate(courtId, date) {
      const bookings = await prisma.booking.findMany({
        where: {
          courtId,
          bookingDate: startOfDay(date),
          ...buildAvailabilityBlockingBookingWhere(new Date()),
        },
        select: {
          startMinute: true,
          endMinute: true,
        },
        orderBy: {
          startMinute: "asc",
        },
      });

      return bookings;
    },
  };
}
