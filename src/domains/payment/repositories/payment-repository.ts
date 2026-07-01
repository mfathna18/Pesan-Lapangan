import type {
  CreatePaymentInput,
  FindPaymentsByBookingIdInput,
  RevenueDashboardQueryInput,
  RevenueSnapshotRecord,
  UpdatePaymentInput,
} from "@/domains/payment/types";
import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
} from "@/generated/prisma/client";

import { DEFAULT_PAYMENT_METHOD } from "@/domains/payment/constants";
import { PAYMENT_STATUS } from "@/domains/payment/constants";

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

  async findPendingByBookingId(bookingId: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: {
        bookingId,
        status: PAYMENT_STATUS.PENDING,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findPaidDetailsByBookingId(bookingId: string): Promise<
    | (Payment & {
        invoice: {
          id: string;
          invoiceNumber: string;
        } | null;
      })
    | null
  > {
    return this.prisma.payment.findFirst({
      where: {
        bookingId,
        status: PAYMENT_STATUS.PAID,
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
    });
  }

  async findLatestByBookingId(bookingId: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
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
        ...(input.paymentUrl !== undefined
          ? { paymentUrl: input.paymentUrl }
          : {}),
        ...(input.snapToken !== undefined
          ? { snapToken: input.snapToken }
          : {}),
        ...(input.paidAt !== undefined ? { paidAt: input.paidAt } : {}),
        ...(input.expiredAt !== undefined
          ? { expiredAt: input.expiredAt }
          : {}),
      },
    });
  }

  async fetchRevenueSnapshot(
    input: RevenueDashboardQueryInput,
  ): Promise<RevenueSnapshotRecord> {
    const paidStatusFilter = { status: PAYMENT_STATUS.PAID } as const;
    const pendingStatusFilter = { status: PAYMENT_STATUS.PENDING } as const;
    const ownerPaymentFilter = {
      booking: {
        court: {
          gor: {
            ownerId: input.ownerId,
          },
        },
      },
    };

    const [
      todayAggregate,
      monthAggregate,
      completedPayments,
      pendingPayments,
      paidInMonth,
      recentPayments,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          ...paidStatusFilter,
          ...ownerPaymentFilter,
          paidAt: {
            gte: input.todayStart,
            lte: input.todayEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          ...paidStatusFilter,
          ...ownerPaymentFilter,
          paidAt: {
            gte: input.monthStart,
            lte: input.monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.payment.count({
        where: {
          ...paidStatusFilter,
          ...ownerPaymentFilter,
        },
      }),
      this.prisma.payment.count({
        where: {
          ...pendingStatusFilter,
          ...ownerPaymentFilter,
        },
      }),
      this.prisma.payment.findMany({
        where: {
          ...paidStatusFilter,
          ...ownerPaymentFilter,
          paidAt: {
            gte: input.monthStart,
            lte: input.monthEnd,
          },
        },
        select: {
          paidAt: true,
          amount: true,
        },
      }),
      this.prisma.payment.findMany({
        where: {
          ...ownerPaymentFilter,
          createdAt: {
            gte: input.rangeFrom,
            lte: input.rangeTo,
          },
        },
        select: {
          id: true,
          amount: true,
          status: true,
          paidAt: true,
          booking: {
            select: {
              bookingNumber: true,
              contact: {
                select: {
                  customerName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.recentLimit,
      }),
    ]);

    return {
      todayRevenue: todayAggregate._sum.amount ?? 0,
      monthRevenue: monthAggregate._sum.amount ?? 0,
      completedPayments,
      pendingPayments,
      paidInMonth: paidInMonth.flatMap((payment) =>
        payment.paidAt
          ? [{ paidAt: payment.paidAt, amount: payment.amount }]
          : [],
      ),
      recentPayments,
    };
  }
}

export function createPaymentRepository(
  prisma: PrismaClient,
): PaymentRepository {
  return new PaymentRepository(prisma);
}

export type { Payment, PaymentMethod, PaymentStatus };
