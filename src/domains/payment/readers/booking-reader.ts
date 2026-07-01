import type { BookingStatus, PrismaClient } from "@/generated/prisma/client";

export type BookingForPayment = {
  id: string;
  bookingNumber: string;
  totalPrice: number;
  status: BookingStatus;
  expiresAt: Date;
  contact: {
    customerName: string;
    customerPhone: string;
  } | null;
};

export type BookingReader = {
  findById: (id: string) => Promise<BookingForPayment | null>;
};

export function createPaymentBookingReader(
  prisma: PrismaClient,
): BookingReader {
  return {
    async findById(id) {
      return prisma.booking.findUnique({
        where: { id },
        select: {
          id: true,
          bookingNumber: true,
          totalPrice: true,
          status: true,
          expiresAt: true,
          contact: {
            select: {
              customerName: true,
              customerPhone: true,
            },
          },
        },
      });
    },
  };
}
