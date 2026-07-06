import { formatVenueDateInput } from "@/domains/booking/utils/venue-date";
import { GOR_DEFAULT_TIMEZONE } from "@/domains/owner/constants";

type VenueLocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function readDateTimePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): number {
  const value = parts.find((part) => part.type === type)?.value ?? "0";
  return Number(value);
}

export function getVenueLocalDateTimeParts(
  date: Date,
  timezone: string = GOR_DEFAULT_TIMEZONE,
): VenueLocalDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const hour = readDateTimePart(parts, "hour");

  return {
    year: readDateTimePart(parts, "year"),
    month: readDateTimePart(parts, "month"),
    day: readDateTimePart(parts, "day"),
    hour: hour === 24 ? 0 : hour,
    minute: readDateTimePart(parts, "minute"),
  };
}

function getVenueLocalDateKey(
  date: Date,
  timezone: string = GOR_DEFAULT_TIMEZONE,
): string {
  const parts = getVenueLocalDateTimeParts(date, timezone);
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");

  return `${parts.year}-${month}-${day}`;
}

export function getVenueLocalMinuteOfDay(
  date: Date,
  timezone: string = GOR_DEFAULT_TIMEZONE,
): number {
  const local = getVenueLocalDateTimeParts(date, timezone);

  return local.hour * 60 + local.minute;
}

export function isVenueBookingDateToday(
  bookingDate: Date,
  now: Date = new Date(),
  timezone: string = GOR_DEFAULT_TIMEZONE,
): boolean {
  return (
    formatVenueDateInput(bookingDate) === getVenueLocalDateKey(now, timezone)
  );
}

/**
 * A same-day slot is bookable until its end time (exclusive of the end minute).
 * Example: 13:00–14:00 stays available at 13:59 and becomes unavailable at 14:00.
 */
export function isBookingSlotExpired(input: {
  bookingDate: Date;
  endMinute: number;
  now?: Date;
  timezone?: string;
}): boolean {
  const timezone = input.timezone ?? GOR_DEFAULT_TIMEZONE;
  const now = input.now ?? new Date();
  const bookingDateKey = formatVenueDateInput(input.bookingDate);
  const todayKey = getVenueLocalDateKey(now, timezone);

  if (bookingDateKey < todayKey) {
    return true;
  }

  if (bookingDateKey > todayKey) {
    return false;
  }

  return getVenueLocalMinuteOfDay(now, timezone) >= input.endMinute;
}

/** @deprecated Use isBookingSlotExpired */
export function isSlotPastBookingCutoff(input: {
  bookingDate: Date;
  endMinute: number;
  now?: Date;
  timezone?: string;
}): boolean {
  return isBookingSlotExpired(input);
}
