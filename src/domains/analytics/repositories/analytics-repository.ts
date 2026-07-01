import type {
  OwnerAnalyticsSnapshotQuery,
  OwnerAnalyticsSnapshotRecord,
} from "@/domains/analytics/types";
import { PAYMENT_STATUS } from "@/domains/payment/constants";
import type { PrismaClient } from "@/generated/prisma/client";

type PrismaDbClient =
  | PrismaClient
  | Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >;

export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaDbClient) {}

  async fetchOwnerAnalyticsSnapshot(
    input: OwnerAnalyticsSnapshotQuery,
  ): Promise<OwnerAnalyticsSnapshotRecord> {
    const ownerBookingFilter = {
      court: {
        gor: {
          ownerId: input.ownerId,
        },
      },
    };

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
      totalBookingCount,
      periodBookings,
      recentBookings,
      monthRevenueAggregate,
      activeCourts,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.booking.count({
        where: ownerBookingFilter,
      }),
      this.prisma.booking.findMany({
        where: {
          ...ownerBookingFilter,
          bookingDate: {
            gte: input.queryStart,
            lte: input.queryEnd,
          },
        },
        select: {
          id: true,
          courtId: true,
          courtNameSnapshot: true,
          sportTypeSnapshot: true,
          status: true,
          bookingDate: true,
          startMinute: true,
        },
      }),
      this.prisma.booking.findMany({
        where: ownerBookingFilter,
        orderBy: {
          createdAt: "desc",
        },
        take: input.recentBookingsLimit,
        select: {
          id: true,
          bookingNumber: true,
          courtNameSnapshot: true,
          bookingDate: true,
          startMinute: true,
          endMinute: true,
          status: true,
          createdAt: true,
          contact: {
            select: {
              customerName: true,
            },
          },
          payments: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              status: true,
            },
          },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PAYMENT_STATUS.PAID,
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
      this.prisma.court.count({
        where: {
          isActive: true,
          ...ownerBookingFilter.court,
        },
      }),
      this.prisma.payment.count({
        where: {
          status: PAYMENT_STATUS.PENDING,
          ...ownerPaymentFilter,
        },
      }),
    ]);

    return {
      totalBookingCount,
      periodBookings,
      recentBookings,
      monthRevenue: monthRevenueAggregate._sum.amount ?? 0,
      activeCourts,
      pendingPayments,
    };
  }
}

export function createAnalyticsRepository(
  prisma: PrismaDbClient,
): AnalyticsRepository {
  return new AnalyticsRepository(prisma);
}
