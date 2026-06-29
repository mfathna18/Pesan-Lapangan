import { DAY_OF_WEEK_LABELS } from "@/domains/booking/constants";
import type {
  AnalyticsBookingRecord,
  AnalyticsDashboardData,
  AnalyticsOperatingHoursRecord,
  AnalyticsSnapshotRecord,
} from "@/domains/booking/types";
import { formatMinuteOfDay } from "@/domains/booking/utils/booking-display";
import { formatDateKey } from "@/domains/payment/utils/revenue-date-range";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function eachDayInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = startOfDay(start);
  const lastDay = startOfDay(end);

  while (cursor <= lastDay) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function calculateAvailableMinutesByCourt(
  periodStart: Date,
  periodEnd: Date,
  operatingHours: AnalyticsOperatingHoursRecord[],
): Map<string, number> {
  const availableByCourt = new Map<string, number>();
  const hoursByCourtDay = new Map<string, number>();

  for (const window of operatingHours) {
    const key = `${window.courtId}:${window.dayOfWeek}`;
    const minutes = Math.max(0, window.endMinute - window.startMinute);
    hoursByCourtDay.set(key, (hoursByCourtDay.get(key) ?? 0) + minutes);
  }

  for (const day of eachDayInRange(periodStart, periodEnd)) {
    const dayOfWeek = day.getDay();

    for (const [key, minutes] of hoursByCourtDay.entries()) {
      const [courtId, windowDay] = key.split(":");

      if (Number(windowDay) !== dayOfWeek || !courtId) {
        continue;
      }

      availableByCourt.set(
        courtId,
        (availableByCourt.get(courtId) ?? 0) + minutes,
      );
    }
  }

  return availableByCourt;
}

function calculateBookedMinutesByCourt(
  bookings: AnalyticsBookingRecord[],
): Map<string, number> {
  const bookedByCourt = new Map<string, number>();

  for (const booking of bookings) {
    if (booking.status === "CANCELLED") {
      continue;
    }

    bookedByCourt.set(
      booking.courtId,
      (bookedByCourt.get(booking.courtId) ?? 0) + booking.durationMinute,
    );
  }

  return bookedByCourt;
}

function calculateOccupancyPercent(
  bookedMinutes: number,
  availableMinutes: number,
): number {
  if (availableMinutes <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((bookedMinutes / availableMinutes) * 100));
}

function findPeakEntry(counts: Map<string, number>, fallback: string): string {
  let peakKey = fallback;
  let peakCount = -1;

  for (const [key, count] of counts.entries()) {
    if (count > peakCount) {
      peakKey = key;
      peakCount = count;
    }
  }

  return peakCount > 0 ? peakKey : fallback;
}

export function buildAnalyticsDashboard(
  snapshot: AnalyticsSnapshotRecord,
  periodStart: Date,
  periodEnd: Date,
  topCourtsLimit: number,
): AnalyticsDashboardData {
  const { bookings, courts, operatingHours } = snapshot;
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  ).length;
  const cancelledCount = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  ).length;

  const courtNameById = new Map(
    courts.map((court) => [court.id, court.name] as const),
  );

  const bookingsByCourt = new Map<string, number>();
  const revenueByCourt = new Map<string, number>();
  const hourCounts = new Map<number, number>();
  const bookingsByDayOfWeek = new Map<number, number>();
  const bookingsByDate = new Map<string, number>();

  for (const booking of bookings) {
    bookingsByCourt.set(
      booking.courtId,
      (bookingsByCourt.get(booking.courtId) ?? 0) + 1,
    );

    const paidAmount = booking.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    if (paidAmount > 0) {
      revenueByCourt.set(
        booking.courtId,
        (revenueByCourt.get(booking.courtId) ?? 0) + paidAmount,
      );
    }

    const hour = Math.floor(booking.startMinute / 60);
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);

    const dayOfWeek = booking.bookingDate.getDay();
    bookingsByDayOfWeek.set(
      dayOfWeek,
      (bookingsByDayOfWeek.get(dayOfWeek) ?? 0) + 1,
    );

    const dateKey = formatDateKey(booking.bookingDate);
    bookingsByDate.set(dateKey, (bookingsByDate.get(dateKey) ?? 0) + 1);
  }

  const mostBookedCourtId = findPeakEntry(bookingsByCourt, "");
  const mostBookedCourt =
    courtNameById.get(mostBookedCourtId) ??
    bookings.find((booking) => booking.courtId === mostBookedCourtId)
      ?.courtNameSnapshot ??
    "-";

  const peakHour = Number(
    findPeakEntry(
      new Map(
        [...hourCounts.entries()].map(([hour, count]) => [String(hour), count]),
      ),
      "-1",
    ),
  );
  const peakBookingHour =
    peakHour >= 0
      ? `${formatMinuteOfDay(peakHour * 60)} - ${formatMinuteOfDay(peakHour * 60 + 60)}`
      : "-";

  const peakDayIndex = Number(
    findPeakEntry(
      new Map(
        [...bookingsByDayOfWeek.entries()].map(([day, count]) => [
          String(day),
          count,
        ]),
      ),
      "-1",
    ),
  );
  const peakBookingDay =
    peakDayIndex >= 0 && peakDayIndex <= 6
      ? (DAY_OF_WEEK_LABELS[peakDayIndex] ?? "-")
      : "-";

  const availableMinutesByCourt = calculateAvailableMinutesByCourt(
    periodStart,
    periodEnd,
    operatingHours,
  );
  const bookedMinutesByCourt = calculateBookedMinutesByCourt(bookings);

  let totalAvailableMinutes = 0;
  let totalBookedMinutes = 0;

  for (const court of courts) {
    totalAvailableMinutes += availableMinutesByCourt.get(court.id) ?? 0;
    totalBookedMinutes += bookedMinutesByCourt.get(court.id) ?? 0;
  }

  const courtUtilizationRows = courts.map((court) => ({
    courtId: court.id,
    courtName: court.name,
    occupancyPercent: calculateOccupancyPercent(
      bookedMinutesByCourt.get(court.id) ?? 0,
      availableMinutesByCourt.get(court.id) ?? 0,
    ),
  }));

  const topCourts = [...bookingsByCourt.entries()]
    .map(([courtId, totalCourtBookings]) => ({
      courtId,
      courtName: courtNameById.get(courtId) ?? courtId,
      totalBookings: totalCourtBookings,
      revenue: revenueByCourt.get(courtId) ?? 0,
      occupancyPercent: calculateOccupancyPercent(
        bookedMinutesByCourt.get(courtId) ?? 0,
        availableMinutesByCourt.get(courtId) ?? 0,
      ),
    }))
    .sort((left, right) => {
      if (right.totalBookings !== left.totalBookings) {
        return right.totalBookings - left.totalBookings;
      }

      return right.revenue - left.revenue;
    })
    .slice(0, topCourtsLimit);

  const bookingsByDay = eachDayInRange(periodStart, periodEnd).map((day) => {
    const dateKey = formatDateKey(day);

    return {
      label: dateKey,
      count: bookingsByDate.get(dateKey) ?? 0,
    };
  });

  const bookingsByHour = Array.from({ length: 24 }, (_, hour) => ({
    label: formatMinuteOfDay(hour * 60),
    count: hourCounts.get(hour) ?? 0,
  }));

  return {
    cards: {
      mostBookedCourt,
      peakBookingHour,
      peakBookingDay,
      bookingSuccessRate:
        totalBookings > 0
          ? Math.round((confirmedCount / totalBookings) * 100)
          : 0,
      cancellationRate:
        totalBookings > 0
          ? Math.round((cancelledCount / totalBookings) * 100)
          : 0,
      courtUtilization: calculateOccupancyPercent(
        totalBookedMinutes,
        totalAvailableMinutes,
      ),
    },
    charts: {
      bookingsByDay,
      bookingsByHour,
      courtUtilization: courtUtilizationRows,
    },
    topCourts,
    period: {
      from: periodStart.toISOString(),
      to: periodEnd.toISOString(),
    },
  };
}
