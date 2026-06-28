import { BOOKING_INTERVAL_MINUTES } from "@/domains/availability/constants";
import type { TimeInterval } from "@/domains/availability/types";

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return a.startMinute < b.endMinute && b.startMinute < a.endMinute;
}

export function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (intervals.length === 0) {
    return [];
  }

  const sorted = [...intervals].sort(
    (left, right) => left.startMinute - right.startMinute,
  );

  const merged: TimeInterval[] = [];
  let current = sorted[0];

  if (!current) {
    return [];
  }

  for (const interval of sorted.slice(1)) {
    if (interval.startMinute <= current.endMinute) {
      current = {
        startMinute: current.startMinute,
        endMinute: Math.max(current.endMinute, interval.endMinute),
      };
      continue;
    }

    merged.push(current);
    current = interval;
  }

  merged.push(current);
  return merged;
}

export function generateFixedIntervalSlots(
  interval: TimeInterval,
  slotMinutes: number = BOOKING_INTERVAL_MINUTES,
): TimeInterval[] {
  const slots: TimeInterval[] = [];

  for (
    let start = interval.startMinute;
    start + slotMinutes <= interval.endMinute;
    start += slotMinutes
  ) {
    slots.push({
      startMinute: start,
      endMinute: start + slotMinutes,
    });
  }

  return slots;
}

export function isIntervalFullyContained(
  slot: TimeInterval,
  container: TimeInterval,
): boolean {
  return (
    slot.startMinute >= container.startMinute &&
    slot.endMinute <= container.endMinute
  );
}

export function excludeOverlappingSlots<T extends TimeInterval>(
  slots: T[],
  blockedIntervals: TimeInterval[],
): T[] {
  return slots.filter(
    (slot) =>
      !blockedIntervals.some((blocked) => intervalsOverlap(slot, blocked)),
  );
}

export function dedupeSlotsByStartMinute<T extends TimeInterval>(
  slots: T[],
): T[] {
  const seen = new Map<number, T>();

  for (const slot of slots) {
    if (!seen.has(slot.startMinute)) {
      seen.set(slot.startMinute, slot);
    }
  }

  return [...seen.values()].sort(
    (left, right) => left.startMinute - right.startMinute,
  );
}
