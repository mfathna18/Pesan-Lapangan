import type { PrismaClient } from "@/generated/prisma/client";

export type BookingWriter = {
  confirmIfPending: (bookingId: string) => Promise<void>;
  cancelIfPending: (bookingId: string) => Promise<void>;
};

export function createPaymentBookingWriter(
  prisma: PrismaClient,
): BookingWriter {
  return {
    async confirmIfPending(bookingId) {
      await prisma.booking.updateMany({
        where: {
          id: bookingId,
          status: "PENDING",
        },
        data: {
          status: "CONFIRMED",
        },
      });
    },

    async cancelIfPending(bookingId) {
      await prisma.booking.updateMany({
        where: {
          id: bookingId,
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      });
    },
  };
}
