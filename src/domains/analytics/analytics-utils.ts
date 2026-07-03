import {
  endOfMonth,
  formatDateKey,
  startOfMonth,
} from "@/domains/payment/utils/revenue-date-range";

import type {
  BiBookingRecord,
  BiOperatingHoursRecord,
  OccupancyStatus,
} from "./analytics-types";

export { endOfMonth, formatDateKey, startOfMonth };

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

export function startOfWeek(date: Date): Date {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  value.setDate(value.getDate() + diff);

  return value;
}

export function endOfWeek(date: Date): Date {
  const value = startOfWeek(date);
  value.setDate(value.getDate() + 6);

  return endOfDay(value);
}

export function previousMonthRange(referenceDate: Date): {
  start: Date;
  end: Date;
} {
  const previousMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - 1,
    1,
  );

  return {
    start: startOfMonth(previousMonth),
    end: endOfMonth(previousMonth),
  };
}

export function trendRange(
  referenceDate: Date,
  days: number,
): {
  start: Date;
  end: Date;
} {
  const end = endOfDay(referenceDate);
  const start = startOfDay(referenceDate);
  start.setDate(start.getDate() - (days - 1));

  return { start, end };
}

export function isSameDay(left: Date, right: Date): boolean {
  return formatDateKey(left) === formatDateKey(right);
}

export function isDateWithinRange(
  date: Date,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  const value = startOfDay(date).getTime();
  const start = startOfDay(rangeStart).getTime();
  const end = startOfDay(rangeEnd).getTime();

  return value >= start && value <= end;
}

export function eachDayInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = startOfDay(start);
  const lastDay = startOfDay(end);

  while (cursor <= lastDay) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function calculateAvailableMinutesByCourt(
  periodStart: Date,
  periodEnd: Date,
  operatingHours: BiOperatingHoursRecord[],
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

export function calculateBookedMinutesByCourt(
  bookings: BiBookingRecord[],
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

export function calculateOccupancyPercent(
  bookedMinutes: number,
  availableMinutes: number,
): number {
  if (availableMinutes <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((bookedMinutes / availableMinutes) * 100));
}

export function resolveOccupancyStatus(percent: number): OccupancyStatus {
  if (percent >= 70) {
    return "excellent";
  }

  if (percent >= 40) {
    return "good";
  }

  return "needs_attention";
}

export function calculateDayOccupancyPercent(
  bookings: BiBookingRecord[],
  operatingHours: BiOperatingHoursRecord[],
  courts: { id: string }[],
  dayOfWeek: number,
  periodStart: Date,
  periodEnd: Date,
): number {
  const daysInRange = eachDayInRange(periodStart, periodEnd).filter(
    (day) => day.getDay() === dayOfWeek,
  );

  if (daysInRange.length === 0) {
    return 0;
  }

  let availableMinutes = 0;
  let bookedMinutes = 0;
  const dayCount = daysInRange.length;

  for (const court of courts) {
    const courtHours = operatingHours.filter(
      (window) => window.courtId === court.id && window.dayOfWeek === dayOfWeek,
    );

    for (const window of courtHours) {
      availableMinutes +=
        Math.max(0, window.endMinute - window.startMinute) * dayCount;
    }

    for (const booking of bookings) {
      if (
        booking.courtId === court.id &&
        booking.status !== "CANCELLED" &&
        booking.bookingDate.getDay() === dayOfWeek &&
        isDateWithinRange(booking.bookingDate, periodStart, periodEnd)
      ) {
        bookedMinutes += booking.durationMinute;
      }
    }
  }

  return calculateOccupancyPercent(bookedMinutes, availableMinutes);
}

export function countUniqueCustomers(bookings: BiBookingRecord[]): number {
  const phones = new Set<string>();

  for (const booking of bookings) {
    if (booking.status === "CANCELLED") {
      continue;
    }

    const phone = booking.contact?.customerPhone?.trim();

    if (phone) {
      phones.add(phone);
    }
  }

  return phones.size;
}

export function filterBookingsInRange(
  bookings: BiBookingRecord[],
  rangeStart: Date,
  rangeEnd: Date,
): BiBookingRecord[] {
  return bookings.filter(
    (booking) =>
      booking.status !== "CANCELLED" &&
      isDateWithinRange(booking.bookingDate, rangeStart, rangeEnd),
  );
}

export function calculatePercentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null;
  }

  return Math.round(((current - previous) / previous) * 100);
}

export function resolveTrendDirection(
  changePercent: number | null,
): "up" | "down" | "flat" {
  if (changePercent === null || changePercent === 0) {
    return "flat";
  }

  return changePercent > 0 ? "up" : "down";
}

export function findPeakEntry(
  counts: Map<string, number>,
  fallback: string,
): string {
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

export function sumPaidRevenue(booking: BiBookingRecord): number {
  return booking.payments.reduce(
    (sum, payment) => (payment.status === "PAID" ? sum + payment.amount : sum),
    0,
  );
}
