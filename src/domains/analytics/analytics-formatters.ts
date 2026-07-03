import { DAY_OF_WEEK_LABELS } from "@/domains/booking/constants";
import {
  formatCurrency,
  formatMinuteOfDay,
} from "@/domains/booking/utils/booking-display";
import { formatSportTypeLabel } from "@/domains/booking/utils/court-display";

import type { OccupancyStatus } from "./analytics-types";

export function formatOccupancyStatusLabel(status: OccupancyStatus): string {
  switch (status) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "needs_attention":
      return "Needs Attention";
    default:
      return "Needs Attention";
  }
}

export function formatPercentChange(changePercent: number | null): string {
  if (changePercent === null) {
    return "—";
  }

  const prefix = changePercent > 0 ? "+" : "";

  return `${prefix}${changePercent}%`;
}

export function formatComparisonLabel(changePercent: number | null): string {
  if (changePercent === null) {
    return "Tidak ada data periode sebelumnya";
  }

  if (changePercent === 0) {
    return "Sama dengan bulan lalu";
  }

  const direction = changePercent > 0 ? "naik" : "turun";

  return `${formatPercentChange(changePercent)} ${direction} vs bulan lalu`;
}

export function formatDayOfWeekLabel(dayIndex: number): string {
  if (dayIndex >= 0 && dayIndex <= 6) {
    return DAY_OF_WEEK_LABELS[dayIndex] ?? "-";
  }

  return "-";
}

export function formatHourRangeLabel(hour: number): string {
  if (hour < 0 || hour > 23) {
    return "-";
  }

  return `${formatMinuteOfDay(hour * 60)} – ${formatMinuteOfDay(hour * 60 + 60)}`;
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes <= 0) {
    return "0 menit";
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder} menit`;
  }

  if (remainder === 0) {
    return `${hours} jam`;
  }

  return `${hours} jam ${remainder} menit`;
}

export function formatSportLabel(sportType: string): string {
  return formatSportTypeLabel(sportType);
}

export function formatRevenueValue(amount: number): string {
  return formatCurrency(amount);
}

export function formatCountValue(count: number): string {
  return count.toLocaleString("id-ID");
}

export function formatOccupancyValue(percent: number): string {
  return `${percent}%`;
}

export function formatShortDateLabel(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export function formatActivityTimestamp(isoDate: string): string {
  return new Date(isoDate).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
