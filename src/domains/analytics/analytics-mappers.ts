import { resolveBookingPaymentDisplayStatus } from "@/domains/booking/utils/booking-display";
import { formatMinuteOfDay } from "@/domains/booking/utils/booking-display";
import { formatDateKey } from "@/domains/payment/utils/revenue-date-range";

import {
  formatComparisonLabel,
  formatCountValue,
  formatDayOfWeekLabel,
  formatDurationMinutes,
  formatHourRangeLabel,
  formatOccupancyStatusLabel,
  formatOccupancyValue,
  formatRevenueValue,
  formatShortDateLabel,
  formatSportLabel,
} from "./analytics-formatters";
import { buildRecommendations } from "./analytics-rules";
import type {
  BiActivityEvent,
  BiBusinessIntelligenceSnapshot,
  BiInsightCard,
  BiKpiCard,
  BiOccupancyKpi,
  BiQuickAction,
  BiTrendSeries,
  BusinessIntelligenceDashboardData,
  OwnerAnalyticsDashboardData,
  OwnerAnalyticsSnapshotRecord,
} from "./analytics-types";
import { ANALYTICS_LIMITS } from "./analytics-types";
import {
  calculateAvailableMinutesByCourt,
  calculateBookedMinutesByCourt,
  calculateDayOccupancyPercent,
  calculateOccupancyPercent,
  calculatePercentChange,
  countUniqueCustomers,
  eachDayInRange,
  endOfMonth,
  endOfWeek,
  filterBookingsInRange,
  findPeakEntry,
  isDateWithinRange,
  isSameDay,
  resolveOccupancyStatus,
  resolveTrendDirection,
  startOfMonth,
  startOfWeek,
  sumPaidRevenue,
} from "./analytics-utils";

const QUICK_ACTIONS: BiQuickAction[] = [
  {
    id: "add-court",
    title: "Tambah Lapangan",
    description: "Kelola dan tambah lapangan venue.",
    href: "/dashboard/courts",
  },
  {
    id: "pricing",
    title: "Atur Harga",
    description: "Sesuaikan tarif per jam dan hari.",
    href: "/dashboard/pricing",
  },
  {
    id: "operating-hours",
    title: "Jam Operasional",
    description: "Atur jadwal buka venue.",
    href: "/dashboard/operating-hours",
  },
  {
    id: "export",
    title: "Export Data",
    description: "Unduh booking, invoice, dan pendapatan.",
    href: "/dashboard/bookings",
  },
  {
    id: "bookings",
    title: "Lihat Booking",
    description: "Pantau dan kelola semua booking.",
    href: "/dashboard/bookings",
  },
];

function buildKpiCard(input: {
  id: string;
  title: string;
  value: string;
  current: number;
  previous: number;
  calculation: string;
  accent?: "green" | "default";
}): BiKpiCard {
  const changePercent = calculatePercentChange(input.current, input.previous);

  return {
    id: input.id,
    title: input.title,
    value: input.value,
    comparison: {
      current: input.current,
      previous: input.previous,
      changePercent,
      periodLabel: formatComparisonLabel(changePercent),
    },
    trend: resolveTrendDirection(changePercent),
    calculation: input.calculation,
    accent: input.accent,
  };
}

function buildActivityTimeline(
  snapshot: BiBusinessIntelligenceSnapshot,
  limit: number,
): BiActivityEvent[] {
  const events: BiActivityEvent[] = [];

  for (const booking of snapshot.activityBookings) {
    if (booking.status === "CANCELLED") {
      events.push({
        id: `cancelled-${booking.id}`,
        type: "booking_cancelled",
        title: "Booking Dibatalkan",
        description: `${booking.bookingNumber} · ${booking.courtNameSnapshot}`,
        timestamp: booking.updatedAt.toISOString(),
      });
    } else {
      events.push({
        id: `created-${booking.id}`,
        type: "booking_created",
        title: "Booking Dibuat",
        description: `${booking.bookingNumber} · ${booking.contact?.customerName ?? "Pelanggan"} · ${booking.courtNameSnapshot}`,
        timestamp: booking.createdAt.toISOString(),
      });
    }
  }

  for (const payment of snapshot.activityPayments) {
    if (!payment.paidAt) {
      continue;
    }

    events.push({
      id: `payment-${payment.id}`,
      type: "payment_received",
      title: "Pembayaran Diterima",
      description: `${payment.booking.bookingNumber} · ${formatRevenueValue(payment.amount)}`,
      timestamp: payment.paidAt.toISOString(),
    });
  }

  for (const invoice of snapshot.activityInvoices) {
    events.push({
      id: `invoice-${invoice.id}`,
      type: "invoice_generated",
      title: "Invoice Dibuat",
      description: `${invoice.invoiceNumber} · ${invoice.customerNameSnapshot}`,
      timestamp: invoice.generatedAt.toISOString(),
    });
  }

  return events
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() -
        new Date(left.timestamp).getTime(),
    )
    .slice(0, limit);
}

function buildTrendSeries(
  snapshot: BiBusinessIntelligenceSnapshot,
  trendStart: Date,
  trendEnd: Date,
): BiTrendSeries[] {
  const days = eachDayInRange(trendStart, trendEnd);

  const revenueByDay = new Map<string, number>();
  const bookingsByDay = new Map<string, number>();

  for (const day of days) {
    const key = formatDateKey(day);
    revenueByDay.set(key, 0);
    bookingsByDay.set(key, 0);
  }

  for (const payment of snapshot.trendPayments) {
    if (!payment.paidAt) {
      continue;
    }

    const key = formatDateKey(payment.paidAt);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + payment.amount);
  }

  for (const booking of snapshot.trendBookings) {
    if (booking.status === "CANCELLED") {
      continue;
    }

    const key = formatDateKey(booking.bookingDate);
    bookingsByDay.set(key, (bookingsByDay.get(key) ?? 0) + 1);
  }

  return [
    {
      id: "revenue-trend",
      title: "Tren Pendapatan (7 Hari)",
      calculation:
        "Total pembayaran PAID per hari dalam 7 hari terakhir, berdasarkan paidAt.",
      points: days.map((day) => {
        const key = formatDateKey(day);

        return {
          label: formatShortDateLabel(day),
          value: revenueByDay.get(key) ?? 0,
        };
      }),
    },
    {
      id: "booking-trend",
      title: "Tren Booking (7 Hari)",
      calculation:
        "Jumlah booking non-dibatalkan per hari dalam 7 hari terakhir, berdasarkan bookingDate.",
      points: days.map((day) => {
        const key = formatDateKey(day);

        return {
          label: formatShortDateLabel(day),
          value: bookingsByDay.get(key) ?? 0,
        };
      }),
    },
  ];
}

function buildInsightCards(
  currentMonthBookings: ReturnType<typeof filterBookingsInRange>,
  snapshot: BiBusinessIntelligenceSnapshot,
  monthStart: Date,
  monthEnd: Date,
): BiInsightCard[] {
  const hourCounts = new Map<number, number>();
  const dayCounts = new Map<number, number>();
  const revenueByCourt = new Map<string, { name: string; revenue: number }>();
  let totalDuration = 0;
  let durationBookingCount = 0;
  let totalPaidRevenue = 0;
  let paidBookingCount = 0;
  let cancelledCount = 0;

  for (const booking of snapshot.periodBookings) {
    if (!isDateWithinRange(booking.bookingDate, monthStart, monthEnd)) {
      continue;
    }

    if (booking.status === "CANCELLED") {
      cancelledCount += 1;
      continue;
    }

    const hour = Math.floor(booking.startMinute / 60);
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);

    const day = booking.bookingDate.getDay();
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);

    totalDuration += booking.durationMinute;
    durationBookingCount += 1;

    const paidAmount = sumPaidRevenue(booking);

    if (paidAmount > 0) {
      totalPaidRevenue += paidAmount;
      paidBookingCount += 1;

      const courtEntry = revenueByCourt.get(booking.courtId);
      revenueByCourt.set(booking.courtId, {
        name: booking.courtNameSnapshot,
        revenue: (courtEntry?.revenue ?? 0) + paidAmount,
      });
    }
  }

  const peakHour = Number(
    findPeakEntry(
      new Map(
        [...hourCounts.entries()].map(([hour, count]) => [String(hour), count]),
      ),
      "-1",
    ),
  );

  const peakDay = Number(
    findPeakEntry(
      new Map(
        [...dayCounts.entries()].map(([day, count]) => [String(day), count]),
      ),
      "-1",
    ),
  );

  let topCourtName = "-";
  let topCourtRevenue = 0;

  for (const entry of revenueByCourt.values()) {
    if (entry.revenue > topCourtRevenue) {
      topCourtRevenue = entry.revenue;
      topCourtName = entry.name;
    }
  }

  const availableByCourt = calculateAvailableMinutesByCourt(
    monthStart,
    monthEnd,
    snapshot.operatingHours,
  );
  const bookedByCourt = calculateBookedMinutesByCourt(currentMonthBookings);

  let lowestCourtName = "-";
  let lowestUtilization = 100;

  for (const court of snapshot.courts) {
    const utilization = calculateOccupancyPercent(
      bookedByCourt.get(court.id) ?? 0,
      availableByCourt.get(court.id) ?? 0,
    );

    if (utilization < lowestUtilization) {
      lowestUtilization = utilization;
      lowestCourtName = court.name;
    }
  }

  const avgDuration =
    durationBookingCount > 0
      ? Math.round(totalDuration / durationBookingCount)
      : 0;
  const avgRevenue =
    paidBookingCount > 0 ? Math.round(totalPaidRevenue / paidBookingCount) : 0;

  return [
    {
      id: "peak-day",
      title: "Hari Terlaris",
      value: formatDayOfWeekLabel(peakDay),
      description: "Hari dengan booking terbanyak bulan ini.",
      variant: "default",
    },
    {
      id: "peak-hour",
      title: "Jam Terlaris",
      value: formatHourRangeLabel(peakHour),
      description: "Jam dengan booking terbanyak bulan ini.",
      variant: "default",
    },
    {
      id: "top-court",
      title: "Lapangan Terlaris",
      value: topCourtName,
      description: `Pendapatan tertinggi: ${formatRevenueValue(topCourtRevenue)}.`,
      variant: "success",
    },
    {
      id: "low-court",
      title: "Lapangan Kurang Laku",
      value: lowestCourtName,
      description: `Utilisasi terendah: ${formatOccupancyValue(lowestUtilization)}.`,
      variant: lowestUtilization < 20 ? "warning" : "muted",
    },
    {
      id: "pending-bookings",
      title: "Booking Pending",
      value: formatCountValue(snapshot.pendingBookings),
      description: "Booking menunggu pembayaran bulan ini.",
      variant: snapshot.pendingBookings > 5 ? "warning" : "muted",
    },
    {
      id: "cancelled-bookings",
      title: "Booking Dibatalkan",
      value: formatCountValue(cancelledCount),
      description: "Booking dibatalkan bulan ini.",
      variant: cancelledCount > 0 ? "warning" : "muted",
    },
    {
      id: "avg-duration",
      title: "Durasi Booking Rata-rata",
      value: formatDurationMinutes(avgDuration),
      description: "Rata-rata durasi booking non-dibatalkan bulan ini.",
      variant: "default",
    },
    {
      id: "avg-revenue",
      title: "Pendapatan Rata-rata per Booking",
      value: formatRevenueValue(avgRevenue),
      description: "Total pembayaran PAID dibagi jumlah booking lunas.",
      variant: "default",
    },
  ];
}

export function buildBusinessIntelligenceDashboard(
  snapshot: BiBusinessIntelligenceSnapshot,
  referenceDate: Date = new Date(),
  limits: typeof ANALYTICS_LIMITS,
): BusinessIntelligenceDashboardData {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const weekStart = startOfWeek(referenceDate);
  const weekEnd = endOfWeek(referenceDate);
  const previousMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - 1,
    1,
  );
  const previousMonthStart = startOfMonth(previousMonth);
  const previousMonthEnd = endOfMonth(previousMonth);

  const currentMonthBookings = filterBookingsInRange(
    snapshot.periodBookings,
    monthStart,
    monthEnd,
  );
  const previousMonthBookings = filterBookingsInRange(
    snapshot.periodBookings,
    previousMonthStart,
    previousMonthEnd,
  );

  const currentCustomers = countUniqueCustomers(currentMonthBookings);
  const previousCustomers = countUniqueCustomers(previousMonthBookings);

  const availableByCourt = calculateAvailableMinutesByCourt(
    monthStart,
    monthEnd,
    snapshot.operatingHours,
  );
  const bookedByCourt = calculateBookedMinutesByCourt(currentMonthBookings);

  let totalAvailableMinutes = 0;
  let totalBookedMinutes = 0;

  for (const court of snapshot.courts) {
    totalAvailableMinutes += availableByCourt.get(court.id) ?? 0;
    totalBookedMinutes += bookedByCourt.get(court.id) ?? 0;
  }

  const occupancyPercent = calculateOccupancyPercent(
    totalBookedMinutes,
    totalAvailableMinutes,
  );
  const occupancyStatus = resolveOccupancyStatus(occupancyPercent);

  const previousAvailableByCourt = calculateAvailableMinutesByCourt(
    previousMonthStart,
    previousMonthEnd,
    snapshot.operatingHours,
  );
  const previousBookedByCourt = calculateBookedMinutesByCourt(
    previousMonthBookings,
  );

  let previousAvailableMinutes = 0;
  let previousBookedMinutes = 0;

  for (const court of snapshot.courts) {
    previousAvailableMinutes += previousAvailableByCourt.get(court.id) ?? 0;
    previousBookedMinutes += previousBookedByCourt.get(court.id) ?? 0;
  }

  const previousOccupancyPercent = calculateOccupancyPercent(
    previousBookedMinutes,
    previousAvailableMinutes,
  );

  let lowestCourtName = "-";
  let lowestCourtUtilization = 100;

  for (const court of snapshot.courts) {
    const utilization = calculateOccupancyPercent(
      bookedByCourt.get(court.id) ?? 0,
      availableByCourt.get(court.id) ?? 0,
    );

    if (utilization < lowestCourtUtilization) {
      lowestCourtUtilization = utilization;
      lowestCourtName = court.name;
    }
  }

  const saturdayOccupancyPercent = calculateDayOccupancyPercent(
    snapshot.periodBookings,
    snapshot.operatingHours,
    snapshot.courts,
    6,
    weekStart,
    weekEnd,
  );

  const revenueChangePercent = calculatePercentChange(
    snapshot.currentMonthRevenue,
    snapshot.previousMonthRevenue,
  );

  const recommendations = buildRecommendations({
    occupancyPercent,
    saturdayOccupancyPercent,
    lowestCourtUtilization,
    lowestCourtName,
    pendingBookings: snapshot.pendingBookings,
    pendingPayments: snapshot.pendingPayments,
    revenueChangePercent,
    revenueIncreased: revenueChangePercent !== null && revenueChangePercent > 0,
  });

  const revenueKpi = buildKpiCard({
    id: "revenue",
    title: "Pendapatan Bulan Ini",
    value: formatRevenueValue(snapshot.currentMonthRevenue),
    current: snapshot.currentMonthRevenue,
    previous: snapshot.previousMonthRevenue,
    calculation:
      "Total amount pembayaran berstatus PAID dengan paidAt dalam bulan berjalan.",
    accent: "green",
  });

  const bookingsKpi = buildKpiCard({
    id: "bookings",
    title: "Booking Bulan Ini",
    value: formatCountValue(currentMonthBookings.length),
    current: currentMonthBookings.length,
    previous: previousMonthBookings.length,
    calculation:
      "Jumlah booking non-dibatalkan dengan bookingDate dalam bulan berjalan.",
  });

  const customersKpi = buildKpiCard({
    id: "customers",
    title: "Customer Aktif",
    value: formatCountValue(currentCustomers),
    current: currentCustomers,
    previous: previousCustomers,
    calculation:
      "Jumlah nomor WhatsApp unik dari booking non-dibatalkan bulan ini.",
  });

  const occupancyKpi: BiOccupancyKpi = {
    ...buildKpiCard({
      id: "occupancy",
      title: "Occupancy Rate",
      value: formatOccupancyValue(occupancyPercent),
      current: occupancyPercent,
      previous: previousOccupancyPercent,
      calculation:
        "Total menit booking non-dibatalkan ÷ total menit slot tersedia (operating hours × hari) × 100%.",
    }),
    percent: occupancyPercent,
    status: occupancyStatus,
    statusLabel: formatOccupancyStatusLabel(occupancyStatus),
  };

  occupancyKpi.comparison.periodLabel = `${formatComparisonLabel(
    occupancyKpi.comparison.changePercent,
  )} · Status: ${occupancyKpi.statusLabel}`;

  const trendStart = new Date(referenceDate);
  trendStart.setDate(trendStart.getDate() - (limits.TREND_DAYS - 1));

  return {
    hasData: snapshot.totalBookingCount > 0 || snapshot.courts.length > 0,
    period: {
      from: monthStart.toISOString(),
      to: monthEnd.toISOString(),
      comparisonFrom: previousMonthStart.toISOString(),
      comparisonTo: previousMonthEnd.toISOString(),
    },
    kpis: {
      revenue: revenueKpi,
      bookings: bookingsKpi,
      activeCustomers: customersKpi,
      occupancy: occupancyKpi,
    },
    insights: buildInsightCards(
      currentMonthBookings,
      snapshot,
      monthStart,
      monthEnd,
    ),
    recommendations,
    trends: buildTrendSeries(snapshot, trendStart, referenceDate),
    activity: buildActivityTimeline(snapshot, limits.ACTIVITY_EVENTS),
    quickActions: QUICK_ACTIONS,
  };
}

function countBookingsInRange(
  bookings: OwnerAnalyticsSnapshotRecord["periodBookings"],
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
  bookings: OwnerAnalyticsSnapshotRecord["periodBookings"],
  referenceDate: Date,
): number {
  return bookings.filter(
    (booking) =>
      booking.status !== "CANCELLED" &&
      isSameDay(booking.bookingDate, referenceDate),
  ).length;
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

export function buildOwnerAnalyticsDashboard(
  snapshot: OwnerAnalyticsSnapshotRecord,
  referenceDate: Date = new Date(),
  topCourtsLimit: number,
  topHoursLimit: number,
): OwnerAnalyticsDashboardData {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const weekStart = startOfWeek(referenceDate);
  const weekEnd = endOfWeek(referenceDate);
  const monthBookings = snapshot.periodBookings.filter(
    (booking) =>
      booking.status !== "CANCELLED" &&
      isDateWithinRange(booking.bookingDate, monthStart, monthEnd),
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
    .slice(0, topCourtsLimit);

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
    .slice(0, topHoursLimit);

  const sportDistribution = [...sportCounts.entries()]
    .map(([sportType, count]) => ({
      sportType,
      label: formatSportLabel(sportType),
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
