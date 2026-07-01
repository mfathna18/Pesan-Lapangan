import type { PrismaClient } from "@/generated/prisma/client";

import { BookingRepository } from "@/domains/booking/repositories/booking-repository";

export type ExpirePendingBookingsResult = {
  expiredCount: number;
};

export class BookingExpirationService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async expirePendingBookings(
    referenceDate: Date = new Date(),
  ): Promise<ExpirePendingBookingsResult> {
    const expiredCount =
      await this.bookingRepository.expirePendingBookings(referenceDate);

    return { expiredCount };
  }
}

export function createBookingExpirationService(
  prisma: PrismaClient,
): BookingExpirationService {
  return new BookingExpirationService(new BookingRepository(prisma));
}
