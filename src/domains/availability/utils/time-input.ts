import { formatMinuteOfDay } from "@/domains/booking/utils/booking-display";

const TIME_VALUE_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTimeValueToMinute(value: string): number | null {
  const match = TIME_VALUE_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
}

export function minuteOfDayToTimeValue(minute: number): string {
  return formatMinuteOfDay(minute);
}

export function isValidTimeValue(value: string): boolean {
  return parseTimeValueToMinute(value) !== null;
}
