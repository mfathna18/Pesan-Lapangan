import type { RevenueDateRangePreset } from "@/domains/payment/constants";
import { REVENUE_DATE_RANGE } from "@/domains/payment/constants";

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

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function resolveRevenueDateRange(
  preset: RevenueDateRangePreset,
  referenceDate: Date,
  customFrom?: Date,
  customTo?: Date,
): { from: Date; to: Date } {
  const todayEnd = endOfDay(referenceDate);

  switch (preset) {
    case REVENUE_DATE_RANGE.TODAY:
      return {
        from: startOfDay(referenceDate),
        to: todayEnd,
      };
    case REVENUE_DATE_RANGE.SEVEN_DAYS: {
      const from = startOfDay(referenceDate);
      from.setDate(from.getDate() - 6);

      return { from, to: todayEnd };
    }
    case REVENUE_DATE_RANGE.THIRTY_DAYS: {
      const from = startOfDay(referenceDate);
      from.setDate(from.getDate() - 29);

      return { from, to: todayEnd };
    }
    case REVENUE_DATE_RANGE.CUSTOM: {
      if (!customFrom || !customTo) {
        const from = startOfDay(referenceDate);
        from.setDate(from.getDate() - 29);

        return { from, to: todayEnd };
      }

      return {
        from: startOfDay(customFrom),
        to: endOfDay(customTo),
      };
    }
    default:
      return resolveRevenueDateRange(
        REVENUE_DATE_RANGE.THIRTY_DAYS,
        referenceDate,
      );
  }
}

export function buildMonthDailyRevenuePoints(
  monthStart: Date,
  monthEnd: Date,
  paidPayments: { paidAt: Date; amount: number }[],
): { date: string; revenue: number }[] {
  const revenueByDay = new Map<string, number>();

  for (const payment of paidPayments) {
    const key = formatDateKey(payment.paidAt);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + payment.amount);
  }

  const points: { date: string; revenue: number }[] = [];
  const cursor = startOfDay(monthStart);
  const lastDay = startOfDay(monthEnd);

  while (cursor <= lastDay) {
    const key = formatDateKey(cursor);
    points.push({
      date: key,
      revenue: revenueByDay.get(key) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseRevenueDateRangePreset(
  value: string | undefined,
): RevenueDateRangePreset {
  if (
    value === REVENUE_DATE_RANGE.TODAY ||
    value === REVENUE_DATE_RANGE.SEVEN_DAYS ||
    value === REVENUE_DATE_RANGE.THIRTY_DAYS ||
    value === REVENUE_DATE_RANGE.CUSTOM
  ) {
    return value;
  }

  return REVENUE_DATE_RANGE.THIRTY_DAYS;
}

export function parseOptionalDateInput(
  value: string | undefined,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
