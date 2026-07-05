import { BOOKING_CUTOFF_MINUTES } from "@/domains/booking/constants";
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

export function isVenueBookingDateToday(
  bookingDate: Date,
  now: Date = new Date(),
  timezone: string = GOR_DEFAULT_TIMEZONE,
): boolean {
  return (
    formatVenueDateInput(bookingDate) === getVenueLocalDateKey(now, timezone)
  );
}

export function getMinimumBookableStartMinute(
  now: Date = new Date(),
  timezone: string = GOR_DEFAULT_TIMEZONE,
  cutoffMinutes: number = BOOKING_CUTOFF_MINUTES,
): number {
  const local = getVenueLocalDateTimeParts(now, timezone);

  return local.hour * 60 + local.minute + cutoffMinutes;
}

export function isSlotPastBookingCutoff(input: {
  bookingDate: Date;
  startMinute: number;
  now?: Date;
  timezone?: string;
  cutoffMinutes?: number;
}): boolean {
  const timezone = input.timezone ?? GOR_DEFAULT_TIMEZONE;
  const now = input.now ?? new Date();
  const cutoffMinutes = input.cutoffMinutes ?? BOOKING_CUTOFF_MINUTES;

  if (!isVenueBookingDateToday(input.bookingDate, now, timezone)) {
    return false;
  }

  return (
    input.startMinute <
    getMinimumBookableStartMinute(now, timezone, cutoffMinutes)
  );
}
