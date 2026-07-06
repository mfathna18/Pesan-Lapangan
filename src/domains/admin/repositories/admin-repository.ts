import type { PrismaClient } from "@/generated/prisma/client";
import {
  PaymentStatus,
  SubscriptionStatus,
  type SubscriptionPlan,
} from "@/generated/prisma/client";
import type {
  AdminBookingPaymentRow,
  AdminDashboardData,
  AdminOwnerRow,
  AdminOwnersListInput,
  AdminOwnersListResult,
  AdminSubscriptionPaymentRow,
  AdminSubscriptionRow,
  AdminSystemStatus,
  AdminVenueRow,
} from "@/domains/admin/types";

const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.TRIAL,
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.GRACE_PERIOD,
];

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addUtcMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((to.getTime() - from.getTime()) / msPerDay);
}

function toIso(value: Date): string {
  return value.toISOString();
}

export class AdminRepository {
  constructor(private readonly db: PrismaClient) {}

  async getDashboardData(): Promise<AdminDashboardData> {
    const now = new Date();
    const today = startOfUtcDay(now);
    const monthStart = startOfUtcMonth(now);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

    const [
      totalOwners,
      totalVenues,
      totalCourts,
      totalBookings,
      todayBookings,
      monthlyRevenueAgg,
      activeSubscriptions,
      expiredSubscriptions,
      recentBookings,
      recentOwners,
      recentSubscriptions,
      recentSubscriptionPayments,
      recentBookingPayments,
      newOwnersLast30Days,
      paidSubscriptionPayments,
      bookingsByMonth,
      sportCounts,
    ] = await Promise.all([
      this.db.owner.count(),
      this.db.gor.count(),
      this.db.court.count(),
      this.db.booking.count(),
      this.db.booking.count({
        where: { bookingDate: today },
      }),
      this.db.subscriptionPayment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          paidAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      this.db.subscription.count({
        where: { status: { in: ACTIVE_SUBSCRIPTION_STATUSES } },
      }),
      this.db.subscription.count({
        where: { status: SubscriptionStatus.EXPIRED },
      }),
      this.db.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          bookingDate: true,
          createdAt: true,
          gorNameSnapshot: true,
          courtNameSnapshot: true,
          contact: {
            select: { customerName: true },
          },
        },
      }),
      this.db.owner.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          gor: { select: { name: true } },
        },
      }),
      this.db.subscription.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          plan: true,
          status: true,
          createdAt: true,
          owner: {
            select: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      }),
      this.db.subscriptionPayment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          subscription: {
            select: {
              owner: {
                select: {
                  user: { select: { name: true } },
                },
              },
            },
          },
        },
      }),
      this.db.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          booking: {
            select: {
              bookingNumber: true,
              gorNameSnapshot: true,
              contact: { select: { customerName: true } },
            },
          },
        },
      }),
      this.db.owner.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      this.db.subscriptionPayment.findMany({
        where: {
          status: PaymentStatus.PAID,
          paidAt: { gte: addUtcMonths(now, -5) },
        },
        select: { amount: true, paidAt: true },
      }),
      this.db.booking.findMany({
        where: { createdAt: { gte: addUtcMonths(now, -5) } },
        select: { createdAt: true },
      }),
      this.db.court.groupBy({
        by: ["sportType"],
        _count: { sportType: true },
        orderBy: { _count: { sportType: "desc" } },
        take: 6,
      }),
    ]);

    const revenueTrend = buildMonthlyTrend(
      now,
      paidSubscriptionPayments
        .filter((payment) => payment.paidAt)
        .map((payment) => ({
          date: payment.paidAt as Date,
          value: payment.amount,
        })),
    );

    const bookingsTrend = buildMonthlyCountTrend(
      now,
      bookingsByMonth.map((booking) => booking.createdAt),
    );

    const recentPayments = [
      ...recentSubscriptionPayments.map((payment) => ({
        id: payment.id,
        type: "subscription" as const,
        ownerOrCustomer: payment.subscription.owner.user.name ?? "—",
        amount: payment.amount,
        status: payment.status,
        reference: "Langganan",
        createdAt: toIso(payment.createdAt),
      })),
      ...recentBookingPayments.map((payment) => ({
        id: payment.id,
        type: "booking" as const,
        ownerOrCustomer:
          payment.booking.contact?.customerName ??
          payment.booking.gorNameSnapshot,
        amount: payment.amount,
        status: payment.status,
        reference: payment.booking.bookingNumber,
        createdAt: toIso(payment.createdAt),
      })),
    ]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      )
      .slice(0, 10);

    return {
      kpis: {
        totalOwners,
        totalVenues,
        totalCourts,
        totalBookings,
        todayBookings,
        monthlyRevenue: monthlyRevenueAgg._sum.amount ?? 0,
        activeSubscriptions,
        expiredSubscriptions,
      },
      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        customerName: booking.contact?.customerName ?? "—",
        gorName: booking.gorNameSnapshot,
        courtName: booking.courtNameSnapshot,
        bookingDate: booking.bookingDate.toISOString().slice(0, 10),
        status: booking.status,
        createdAt: toIso(booking.createdAt),
      })),
      recentRegistrations: recentOwners.map((owner) => ({
        id: owner.id,
        ownerName: owner.user.name,
        email: owner.user.email,
        gorName: owner.gor?.name ?? null,
        createdAt: toIso(owner.createdAt),
      })),
      recentSubscriptions: recentSubscriptions.map((subscription) => ({
        id: subscription.id,
        ownerName: subscription.owner.user.name,
        email: subscription.owner.user.email,
        plan: subscription.plan,
        status: subscription.status,
        createdAt: toIso(subscription.createdAt),
      })),
      recentPayments,
      newOwnersLast30Days,
      revenueTrend,
      bookingsTrend,
      popularSports: sportCounts.map((row) => ({
        sport: row.sportType,
        count: row._count.sportType,
      })),
    };
  }

  async listOwners(
    input: AdminOwnersListInput,
  ): Promise<AdminOwnersListResult> {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
    const search = input.search?.trim();

    const where = {
      ...(search
        ? {
            OR: [
              {
                user: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
              {
                user: {
                  email: { contains: search, mode: "insensitive" as const },
                },
              },
              {
                gor: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
      ...(input.plan ? { subscription: { plan: input.plan } } : {}),
      ...(input.status ? { subscription: { status: input.status } } : {}),
    };

    const [total, owners] = await Promise.all([
      this.db.owner.count({ where }),
      this.db.owner.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          gor: { select: { name: true } },
          subscription: { select: { plan: true, status: true } },
        },
      }),
    ]);

    const items: AdminOwnerRow[] = owners.map((owner) => ({
      id: owner.id,
      ownerName: owner.user.name,
      email: owner.user.email,
      gorName: owner.gor?.name ?? null,
      plan: owner.subscription?.plan ?? null,
      status: owner.subscription?.status ?? null,
      createdAt: toIso(owner.createdAt),
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async listVenues(): Promise<AdminVenueRow[]> {
    const venues = await this.db.gor.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        city: true,
        isActive: true,
        updatedAt: true,
        owner: {
          select: {
            user: { select: { name: true } },
          },
        },
        _count: { select: { courts: true } },
      },
    });

    return venues.map((venue) => ({
      id: venue.id,
      venueName: venue.name,
      ownerName: venue.owner.user.name,
      city: venue.city,
      courtCount: venue._count.courts,
      isActive: venue.isActive,
      updatedAt: toIso(venue.updatedAt),
    }));
  }

  async listSubscriptions(): Promise<AdminSubscriptionRow[]> {
    const subscriptions = await this.db.subscription.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        plan: true,
        status: true,
        startsAt: true,
        expiresAt: true,
        owner: {
          select: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    const now = new Date();

    return subscriptions.map((subscription) => ({
      id: subscription.id,
      ownerName: subscription.owner.user.name,
      email: subscription.owner.user.email,
      plan: subscription.plan,
      startsAt: toIso(subscription.startsAt),
      expiresAt: subscription.expiresAt ? toIso(subscription.expiresAt) : null,
      status: subscription.status,
      remainingDays: subscription.expiresAt
        ? daysBetween(now, subscription.expiresAt)
        : null,
    }));
  }

  async listSubscriptionPayments(): Promise<AdminSubscriptionPaymentRow[]> {
    const payments = await this.db.subscriptionPayment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        amount: true,
        status: true,
        targetPlan: true,
        billingAction: true,
        paidAt: true,
        createdAt: true,
        subscription: {
          select: {
            owner: {
              select: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return payments.map((payment) => ({
      id: payment.id,
      ownerName: payment.subscription.owner.user.name,
      amount: payment.amount,
      status: payment.status,
      targetPlan: payment.targetPlan,
      billingAction: payment.billingAction,
      paidAt: payment.paidAt ? toIso(payment.paidAt) : null,
      createdAt: toIso(payment.createdAt),
    }));
  }

  async listBookingPayments(): Promise<AdminBookingPaymentRow[]> {
    const payments = await this.db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        amount: true,
        status: true,
        paidAt: true,
        createdAt: true,
        booking: {
          select: {
            bookingNumber: true,
            gorNameSnapshot: true,
            contact: { select: { customerName: true } },
          },
        },
      },
    });

    return payments.map((payment) => ({
      id: payment.id,
      bookingNumber: payment.booking.bookingNumber,
      customerName: payment.booking.contact?.customerName ?? "—",
      gorName: payment.booking.gorNameSnapshot,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt ? toIso(payment.paidAt) : null,
      createdAt: toIso(payment.createdAt),
    }));
  }

  async getSystemStatus(
    version: string,
    environment: string,
  ): Promise<AdminSystemStatus> {
    let database: AdminSystemStatus["database"] = "unhealthy";

    try {
      await this.db.$queryRaw`SELECT 1`;
      database = "healthy";
    } catch {
      database = "unhealthy";
    }

    const storage =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
        ? "configured"
        : "not_configured";

    return {
      database,
      storage,
      version,
      environment,
      deploymentTime: process.env.VERCEL_DEPLOYMENT_CREATED_AT ?? null,
      deploymentRef: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    };
  }
}

function buildMonthlyTrend(
  referenceDate: Date,
  entries: Array<{ date: Date; value: number }>,
): Array<{ label: string; value: number }> {
  const months = Array.from({ length: 6 }, (_, index) =>
    addUtcMonths(startOfUtcMonth(referenceDate), index - 5),
  );

  return months.map((monthStart) => {
    const monthEnd = addUtcMonths(monthStart, 1);
    const value = entries
      .filter((entry) => entry.date >= monthStart && entry.date < monthEnd)
      .reduce((sum, entry) => sum + entry.value, 0);

    return {
      label: formatMonthLabel(monthStart),
      value,
    };
  });
}

function buildMonthlyCountTrend(
  referenceDate: Date,
  dates: Date[],
): Array<{ label: string; value: number }> {
  const months = Array.from({ length: 6 }, (_, index) =>
    addUtcMonths(startOfUtcMonth(referenceDate), index - 5),
  );

  return months.map((monthStart) => {
    const monthEnd = addUtcMonths(monthStart, 1);
    const value = dates.filter(
      (date) => date >= monthStart && date < monthEnd,
    ).length;

    return {
      label: formatMonthLabel(monthStart),
      value,
    };
  });
}

export type { SubscriptionPlan };
