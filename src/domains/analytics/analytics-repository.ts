import type { PrismaClient } from "@/generated/prisma/client";
import { PAYMENT_STATUS } from "@/domains/payment/constants";

import type {
  BiBusinessIntelligenceSnapshot,
  BiSnapshotQuery,
  OwnerAnalyticsSnapshotQuery,
  OwnerAnalyticsSnapshotRecord,
} from "./analytics-types";
import {
  buildOwnerBookingFilter,
  buildOwnerCourtFilter,
  buildOwnerInvoiceFilter,
  buildOwnerPaymentFilter,
} from "./analytics-queries";

type PrismaDbClient =
  | PrismaClient
  | Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaDbClient) {}

  async fetchBusinessIntelligenceSnapshot(
    input: BiSnapshotQuery,
  ): Promise<BiBusinessIntelligenceSnapshot> {
    const ownerBookingFilter = buildOwnerBookingFilter(input.ownerId);
    const ownerPaymentFilter = buildOwnerPaymentFilter(input.ownerId);
    const ownerCourtFilter = buildOwnerCourtFilter(input.ownerId);
    const ownerInvoiceFilter = buildOwnerInvoiceFilter(input.ownerId);

    const [
      totalBookingCount,
      periodBookings,
      currentMonthRevenueAggregate,
      previousMonthRevenueAggregate,
      courts,
      operatingHours,
      pendingPayments,
      pendingBookings,
      activityBookings,
      activityPayments,
      activityInvoices,
      trendPayments,
      trendBookings,
    ] = await Promise.all([
      this.prisma.booking.count({
        where: ownerBookingFilter,
      }),
      this.prisma.booking.findMany({
        where: {
          ...ownerBookingFilter,
          bookingDate: {
            gte: startOfDay(input.previousMonthStart),
            lte: startOfDay(input.currentMonthEnd),
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
          endMinute: true,
          durationMinute: true,
          totalPrice: true,
          createdAt: true,
          updatedAt: true,
          contact: {
            select: {
              customerPhone: true,
              customerName: true,
            },
          },
          payments: {
            select: {
              status: true,
              amount: true,
              paidAt: true,
            },
          },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PAYMENT_STATUS.PAID,
          ...ownerPaymentFilter,
          paidAt: {
            gte: input.currentMonthStart,
            lte: input.currentMonthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PAYMENT_STATUS.PAID,
          ...ownerPaymentFilter,
          paidAt: {
            gte: input.previousMonthStart,
            lte: input.previousMonthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.court.findMany({
        where: {
          isActive: true,
          ...ownerCourtFilter,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      }),
      this.prisma.operatingHours.findMany({
        where: {
          isActive: true,
          court: ownerCourtFilter,
        },
        select: {
          courtId: true,
          dayOfWeek: true,
          startMinute: true,
          endMinute: true,
        },
      }),
      this.prisma.payment.count({
        where: {
          status: PAYMENT_STATUS.PENDING,
          ...ownerPaymentFilter,
        },
      }),
      this.prisma.booking.count({
        where: {
          ...ownerBookingFilter,
          status: "PENDING",
          bookingDate: {
            gte: startOfDay(input.currentMonthStart),
            lte: startOfDay(input.currentMonthEnd),
          },
        },
      }),
      this.prisma.booking.findMany({
        where: ownerBookingFilter,
        orderBy: { createdAt: "desc" },
        take: input.activityLimit,
        select: {
          id: true,
          bookingNumber: true,
          courtNameSnapshot: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          contact: {
            select: { customerName: true },
          },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          status: PAYMENT_STATUS.PAID,
          ...ownerPaymentFilter,
          paidAt: { not: null },
        },
        orderBy: { paidAt: "desc" },
        take: input.activityLimit,
        select: {
          id: true,
          amount: true,
          paidAt: true,
          booking: {
            select: {
              bookingNumber: true,
              courtNameSnapshot: true,
              contact: { select: { customerName: true } },
            },
          },
        },
      }),
      this.prisma.invoice.findMany({
        where: ownerInvoiceFilter,
        orderBy: { generatedAt: "desc" },
        take: input.activityLimit,
        select: {
          id: true,
          invoiceNumber: true,
          customerNameSnapshot: true,
          courtNameSnapshot: true,
          generatedAt: true,
        },
      }),
      this.prisma.payment.findMany({
        where: {
          status: PAYMENT_STATUS.PAID,
          ...ownerPaymentFilter,
          paidAt: {
            gte: input.trendStart,
            lte: input.trendEnd,
          },
        },
        select: {
          amount: true,
          paidAt: true,
        },
      }),
      this.prisma.booking.findMany({
        where: {
          ...ownerBookingFilter,
          bookingDate: {
            gte: startOfDay(input.trendStart),
            lte: startOfDay(input.trendEnd),
          },
        },
        select: {
          bookingDate: true,
          status: true,
        },
      }),
    ]);

    return {
      totalBookingCount,
      periodBookings,
      currentMonthRevenue: currentMonthRevenueAggregate._sum.amount ?? 0,
      previousMonthRevenue: previousMonthRevenueAggregate._sum.amount ?? 0,
      courts,
      operatingHours,
      pendingPayments,
      pendingBookings,
      activityBookings,
      activityPayments,
      activityInvoices,
      trendPayments,
      trendBookings,
    };
  }

  async fetchOwnerAnalyticsSnapshot(
    input: OwnerAnalyticsSnapshotQuery,
  ): Promise<OwnerAnalyticsSnapshotRecord> {
    const ownerBookingFilter = buildOwnerBookingFilter(input.ownerId);
    const ownerPaymentFilter = buildOwnerPaymentFilter(input.ownerId);

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
          gor: {
            ownerId: input.ownerId,
          },
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
