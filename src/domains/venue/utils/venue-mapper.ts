import { mergeIntervals } from "@/domains/availability/utils/time-interval";
import {
  VENUE_DAY_OF_WEEK_LABELS,
  VENUE_SPORT_TYPE_LABELS,
} from "@/domains/venue/constants";
import type {
  PublicVenueData,
  PublicVenueOpenHours,
  VenueCourtRecord,
  VenueOperatingHoursRecord,
  VenueRecord,
} from "@/domains/venue/types";
import { formatMinuteOfDay } from "@/domains/booking/utils/booking-display";
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

function buildOpenHours(courts: VenueCourtRecord[]): PublicVenueOpenHours[] {
  const hoursByDay = new Map<number, VenueOperatingHoursRecord[]>();

  for (const court of courts) {
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

export function mapVenueRecordToPublicVenue(
  venue: VenueRecord,
): PublicVenueData {
  const activeCourts = venue.courts
    .filter((court) => court.isActive)
    .sort((left, right) => {
      if (left.displayOrder !== right.displayOrder) {
        return left.displayOrder - right.displayOrder;
      }

      return left.name.localeCompare(right.name);
    });

  const sportTypes = [...new Set(activeCourts.map((court) => court.sportType))];

  return {
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    address: venue.address,
    description: venue.description,
    sports: sportTypes.map((type) => ({
      type,
      label: formatSportLabel(type),
    })),
    courts: activeCourts.map((court) => ({
      id: court.id,
      name: court.name,
      sportType: court.sportType,
      sportLabel: formatSportLabel(court.sportType),
    })),
    openHours: buildOpenHours(activeCourts),
  };
}
