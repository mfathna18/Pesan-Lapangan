import type {
  CreatePaymentInput,
  FindPaymentsByBookingIdInput,
  UpdatePaymentInput,
} from "@/domains/payment/types";
import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
} from "@/generated/prisma/client";

import { DEFAULT_PAYMENT_METHOD } from "@/domains/payment/constants";

export class PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreatePaymentInput): Promise<Payment> {
    return this.prisma.payment.create({
      data: {
        bookingId: input.bookingId,
        amount: input.amount,
        method: input.method ?? DEFAULT_PAYMENT_METHOD,
        externalReference: input.externalReference ?? null,
        expiredAt: input.expiredAt ?? null,
      },
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
    });
  }

  async findByBookingId(
    input: FindPaymentsByBookingIdInput,
  ): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { bookingId: input.bookingId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findPaidByBookingId(bookingId: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: {
        bookingId,
        status: "PAID",
      },
    });
  }

  async findByExternalReference(
    externalReference: string,
  ): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: { externalReference },
    });
  }

  async update(input: UpdatePaymentInput): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id: input.id },
      data: {
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.externalReference !== undefined
          ? { externalReference: input.externalReference }
          : {}),
        ...(input.paidAt !== undefined ? { paidAt: input.paidAt } : {}),
        ...(input.expiredAt !== undefined
          ? { expiredAt: input.expiredAt }
          : {}),
      },
    });
  }
}

export function createPaymentRepository(
  prisma: PrismaClient,
): PaymentRepository {
  return new PaymentRepository(prisma);
}

export type { Payment, PaymentMethod, PaymentStatus };
