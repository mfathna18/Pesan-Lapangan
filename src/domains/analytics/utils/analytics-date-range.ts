import {
  endOfMonth,
  formatDateKey,
  startOfMonth,
} from "@/domains/payment/utils/revenue-date-range";

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
