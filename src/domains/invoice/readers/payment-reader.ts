import type { PrismaClient } from "@/generated/prisma/client";

export type PaymentForInvoice = {
  id: string;
  amount: number;
  status: string;
  paidAt: Date | null;
  booking: BookingForInvoice | null;
};

export type BookingForInvoice = {
  bookingNumber: string;
  bookingDate: Date;
  startMinute: number;
  endMinute: number;
  gorNameSnapshot: string;
  courtNameSnapshot: string;
  contact: {
    customerName: string;
    customerPhone: string;
  } | null;
};

export type PaymentReader = {
  findByIdForInvoice: (paymentId: string) => Promise<PaymentForInvoice | null>;
};

export function createInvoicePaymentReader(
  prisma: PrismaClient,
): PaymentReader {
  return {
    async findByIdForInvoice(paymentId) {
      return prisma.payment.findUnique({
        where: { id: paymentId },
        select: {
          id: true,
          amount: true,
          status: true,
          paidAt: true,
          booking: {
            select: {
              bookingNumber: true,
              bookingDate: true,
              startMinute: true,
              endMinute: true,
              gorNameSnapshot: true,
              courtNameSnapshot: true,
              contact: {
                select: {
                  customerName: true,
                  customerPhone: true,
                },
              },
            },
          },
        },
      });
    },
  };
}
