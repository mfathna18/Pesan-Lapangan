import { mergeIntervals } from "@/domains/availability/utils/time-interval";
import type { PublicCourtRecord } from "@/domains/booking/repositories/court-repository";
import { formatMinuteOfDay } from "@/domains/booking/utils/booking-display";
import type { PublicGorRecord } from "@/domains/owner/types";
import {
  VENUE_DAY_OF_WEEK_LABELS,
  VENUE_SPORT_TYPE_LABELS,
} from "@/domains/venue/constants";
import type {
  PublicVenueData,
  PublicVenueOpenHours,
} from "@/domains/venue/types";
import type { SportType } from "@/generated/prisma/client";

function formatSportLabel(sportType: string): string {
  return (
    VENUE_SPORT_TYPE_LABELS[sportType as SportType] ??
    sportType
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function formatHoursRange(startMinute: number, endMinute: number): string {
  return `${formatMinuteOfDay(startMinute)} - ${formatMinuteOfDay(endMinute)}`;
}

function buildOpenHours(courts: PublicCourtRecord[]): PublicVenueOpenHours[] {
  const hoursByDay = new Map<
    number,
    { dayOfWeek: number; startMinute: number; endMinute: number }[]
  >();

  for (const court of courts) {
    if (!court.isActive) {
      continue;
    }

    for (const window of court.operatingHours) {
      if (!window.isActive) {
        continue;
      }

      const existing = hoursByDay.get(window.dayOfWeek) ?? [];
      existing.push(window);
      hoursByDay.set(window.dayOfWeek, existing);
    }
  }

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const dayWindows = hoursByDay.get(dayOfWeek) ?? [];
    const merged = mergeIntervals(
      dayWindows.map((window) => ({
        startMinute: window.startMinute,
        endMinute: window.endMinute,
      })),
    );

    const hours =
      merged.length > 0
        ? merged
            .map((window) =>
              formatHoursRange(window.startMinute, window.endMinute),
            )
            .join(", ")
        : "Tutup";

    return {
      dayOfWeek,
      dayLabel: VENUE_DAY_OF_WEEK_LABELS[dayOfWeek] ?? `Day ${dayOfWeek}`,
      hours,
    };
  });
}

export function mapGorAndCourtsToPublicVenue(
  gor: PublicGorRecord,
  courts: PublicCourtRecord[],
): PublicVenueData {
  const sortedCourts = [...courts].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }

    return left.name.localeCompare(right.name);
  });

  const activeCourts = sortedCourts.filter((court) => court.isActive);
  const sportTypes = [...new Set(activeCourts.map((court) => court.sportType))];

  return {
    id: gor.id,
    name: gor.name,
    slug: gor.slug,
    address: gor.address,
    city: gor.city,
    description: gor.description,
    logoUrl: gor.logoUrl,
    coverImageUrl: gor.coverImageUrl,
    sports: sportTypes.map((type) => ({
      type,
      label: formatSportLabel(type),
    })),
    courts: sortedCourts.map((court) => ({
      id: court.id,
      name: court.name,
      sportType: court.sportType,
      sportLabel: formatSportLabel(court.sportType),
      isActive: court.isActive,
    })),
    openHours: buildOpenHours(sortedCourts),
  };
}
