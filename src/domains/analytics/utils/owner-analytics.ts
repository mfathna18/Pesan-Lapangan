import {
  OWNER_ANALYTICS_TOP_COURTS_LIMIT,
  OWNER_ANALYTICS_TOP_HOURS_LIMIT,
} from "@/domains/analytics/constants";
import type {
  OwnerAnalyticsDashboardData,
  OwnerAnalyticsPeriodBookingRecord,
  OwnerAnalyticsSnapshotRecord,
  OwnerOperationalDashboardData,
} from "@/domains/analytics/types";
import {
  endOfMonth,
  endOfWeek,
  isDateWithinRange,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "@/domains/analytics/utils/analytics-date-range";
import { resolveBookingPaymentDisplayStatus } from "@/domains/booking/utils/booking-display";
import { formatMinuteOfDay } from "@/domains/booking/utils/booking-display";
import { formatSportTypeLabel } from "@/domains/booking/utils/court-display";

function countBookingsInRange(
  bookings: OwnerAnalyticsPeriodBookingRecord[],
  rangeStart: Date,
  rangeEnd: Date,
): number {
  return bookings.filter(
    (booking) =>
      booking.status !== "CANCELLED" &&
      isDateWithinRange(booking.bookingDate, rangeStart, rangeEnd),
  ).length;
}

function countBookingsToday(
  bookings: OwnerAnalyticsPeriodBookingRecord[],
  referenceDate: Date,
): number {
  return bookings.filter(
    (booking) =>
      booking.status !== "CANCELLED" &&
      isSameDay(booking.bookingDate, referenceDate),
  ).length;
}

function buildMonthBookings(
  bookings: OwnerAnalyticsPeriodBookingRecord[],
  monthStart: Date,
  monthEnd: Date,
): OwnerAnalyticsPeriodBookingRecord[] {
  return bookings.filter(
    (booking) =>
      booking.status !== "CANCELLED" &&
      isDateWithinRange(booking.bookingDate, monthStart, monthEnd),
  );
}

function mapRecentBookings(
  snapshot: OwnerAnalyticsSnapshotRecord,
): OwnerAnalyticsDashboardData["recentBookings"] {
  return snapshot.recentBookings.map((booking) => ({
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    customerName: booking.contact?.customerName ?? "-",
    courtName: booking.courtNameSnapshot,
    bookingDate: booking.bookingDate.toISOString(),
    startMinute: booking.startMinute,
    endMinute: booking.endMinute,
    bookingStatus: booking.status,
    paymentStatus: resolveBookingPaymentDisplayStatus(booking.payments),
    createdAt: booking.createdAt.toISOString(),
  }));
}

export function buildOwnerOperationalDashboard(
  snapshot: OwnerAnalyticsSnapshotRecord,
  referenceDate: Date = new Date(),
): OwnerOperationalDashboardData {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  return {
    hasBookings: snapshot.totalBookingCount > 0,
    kpis: {
      bookingsToday: countBookingsToday(snapshot.periodBookings, referenceDate),
      bookingsThisMonth: countBookingsInRange(
        snapshot.periodBookings,
        monthStart,
        monthEnd,
      ),
      revenueThisMonth: snapshot.monthRevenue,
      activeCourts: snapshot.activeCourts,
      pendingPayments: snapshot.pendingPayments,
    },
    recentBookings: mapRecentBookings(snapshot),
  };
}

export function buildOwnerAnalyticsDashboard(
  snapshot: OwnerAnalyticsSnapshotRecord,
  referenceDate: Date = new Date(),
): OwnerAnalyticsDashboardData {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const weekStart = startOfWeek(referenceDate);
  const weekEnd = endOfWeek(referenceDate);
  const monthBookings = buildMonthBookings(
    snapshot.periodBookings,
    monthStart,
    monthEnd,
  );

  const bookingsByCourt = new Map<
    string,
    { courtName: string; count: number }
  >();
  const hourCounts = new Map<number, number>();
  const sportCounts = new Map<string, number>();

  for (const booking of monthBookings) {
    const courtEntry = bookingsByCourt.get(booking.courtId);
    bookingsByCourt.set(booking.courtId, {
      courtName: booking.courtNameSnapshot,
      count: (courtEntry?.count ?? 0) + 1,
    });

    const hour = Math.floor(booking.startMinute / 60);
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);

    sportCounts.set(
      booking.sportTypeSnapshot,
      (sportCounts.get(booking.sportTypeSnapshot) ?? 0) + 1,
    );
  }

  const topCourts = [...bookingsByCourt.entries()]
    .map(([courtId, entry]) => ({
      courtId,
      courtName: entry.courtName,
      totalBookings: entry.count,
    }))
    .sort((left, right) => right.totalBookings - left.totalBookings)
    .slice(0, OWNER_ANALYTICS_TOP_COURTS_LIMIT);

  const topHours = [...hourCounts.entries()]
    .map(([hour, count]) => ({
      label: formatMinuteOfDay(hour * 60),
      count,
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label);
    })
    .slice(0, OWNER_ANALYTICS_TOP_HOURS_LIMIT);

  const sportDistribution = [...sportCounts.entries()]
    .map(([sportType, count]) => ({
      sportType,
      label: formatSportTypeLabel(sportType),
      count,
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label, "id");
    });

  return {
    hasBookings: snapshot.totalBookingCount > 0,
    kpis: {
      bookingsToday: countBookingsToday(snapshot.periodBookings, referenceDate),
      bookingsThisWeek: countBookingsInRange(
        snapshot.periodBookings,
        weekStart,
        weekEnd,
      ),
      bookingsThisMonth: countBookingsInRange(
        snapshot.periodBookings,
        monthStart,
        monthEnd,
      ),
      revenueThisMonth: snapshot.monthRevenue,
    },
    topCourts,
    topHours,
    sportDistribution,
    recentBookings: mapRecentBookings(snapshot),
    period: {
      from: monthStart.toISOString(),
      to: monthEnd.toISOString(),
    },
  };
}
