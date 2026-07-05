import { WHATSAPP_REMINDER_MINUTES_BEFORE } from "@/domains/whatsapp/whatsapp-types";
import type { PrismaClient } from "@/generated/prisma/client";

const REMINDER_WINDOW_MINUTES = 10;

function getTimezoneOffsetMinutes(timezone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });

  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((part) => part.type === "timeZoneName")?.value;

  if (!offsetPart || !offsetPart.startsWith("GMT")) {
    return 7 * 60;
  }

  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(offsetPart);

  if (!match) {
    return 7 * 60;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  return sign * (hours * 60 + minutes);
}

export function getBookingPlayDateTimeUtc(input: {
  bookingDate: Date;
  startMinute: number;
  timezone: string;
}): Date {
  const year = input.bookingDate.getUTCFullYear();
  const month = input.bookingDate.getUTCMonth();
  const day = input.bookingDate.getUTCDate();
  const hours = Math.floor(input.startMinute / 60);
  const minutes = input.startMinute % 60;

  const localAsUtc = Date.UTC(year, month, day, hours, minutes, 0, 0);
  const offsetMinutes = getTimezoneOffsetMinutes(
    input.timezone,
    new Date(localAsUtc),
  );

  return new Date(localAsUtc - offsetMinutes * 60 * 1000);
}

export async function findBookingsDueForReminder(
  prisma: PrismaClient,
  now = new Date(),
): Promise<string[]> {
  const lookAheadHours = 3;
  const lookBackHours = 1;
  const rangeStart = new Date(now.getTime() - lookBackHours * 60 * 60 * 1000);
  const rangeEnd = new Date(now.getTime() + lookAheadHours * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      bookingDate: {
        gte: new Date(
          Date.UTC(
            rangeStart.getUTCFullYear(),
            rangeStart.getUTCMonth(),
            rangeStart.getUTCDate(),
          ),
        ),
        lte: new Date(
          Date.UTC(
            rangeEnd.getUTCFullYear(),
            rangeEnd.getUTCMonth(),
            rangeEnd.getUTCDate(),
          ),
        ),
      },
      contact: {
        isNot: null,
      },
    },
    select: {
      id: true,
      bookingDate: true,
      startMinute: true,
      court: {
        select: {
          gor: {
            select: {
              timezone: true,
            },
          },
        },
      },
    },
  });

  const dueBookingIds: string[] = [];

  for (const booking of bookings) {
    const playAt = getBookingPlayDateTimeUtc({
      bookingDate: booking.bookingDate,
      startMinute: booking.startMinute,
      timezone: booking.court.gor.timezone,
    });

    const minutesUntilPlay = (playAt.getTime() - now.getTime()) / (60 * 1000);
    const targetMinutes = WHATSAPP_REMINDER_MINUTES_BEFORE;
    const windowStart = targetMinutes - REMINDER_WINDOW_MINUTES / 2;
    const windowEnd = targetMinutes + REMINDER_WINDOW_MINUTES / 2;

    if (minutesUntilPlay >= windowStart && minutesUntilPlay <= windowEnd) {
      dueBookingIds.push(booking.id);
    }
  }

  return dueBookingIds;
}
