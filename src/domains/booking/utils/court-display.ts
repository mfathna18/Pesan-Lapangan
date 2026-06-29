import { mergeIntervals } from "@/domains/availability/utils/time-interval";
import { COURT_FACILITY_LABELS } from "@/domains/booking/constants";
import { formatMinuteOfDay } from "@/domains/booking/utils/booking-display";
import type {
  PublicCourtDetailRecord,
  PublicCourtOpenHours,
} from "@/domains/booking/types";
import { VENUE_DAY_OF_WEEK_LABELS } from "@/domains/venue/constants";
import { VENUE_SPORT_TYPE_LABELS } from "@/domains/venue/constants";
import type { CourtFacility, SportType } from "@/generated/prisma/client";

type OperatingHoursLike = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  isActive: boolean;
};

type PriceRuleLike = {
  price: number;
  isActive: boolean;
};

function formatHoursRange(startMinute: number, endMinute: number): string {
  return `${formatMinuteOfDay(startMinute)} - ${formatMinuteOfDay(endMinute)}`;
}

export function formatSportTypeLabel(sportType: string): string {
  return (
    VENUE_SPORT_TYPE_LABELS[sportType as SportType] ??
    sportType
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function buildOpenHoursFromWindows(
  operatingHours: OperatingHoursLike[],
): PublicCourtOpenHours[] {
  const hoursByDay = new Map<number, OperatingHoursLike[]>();

  for (const window of operatingHours) {
    if (!window.isActive) {
      continue;
    }

    const existing = hoursByDay.get(window.dayOfWeek) ?? [];
    existing.push(window);
    hoursByDay.set(window.dayOfWeek, existing);
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

export function resolveStartingPrice(
  priceRules: PriceRuleLike[],
): number | null {
  const activePrices = priceRules
    .filter((rule) => rule.isActive)
    .map((rule) => rule.price);

  if (activePrices.length === 0) {
    return null;
  }

  return Math.min(...activePrices);
}

export function mapFacilityLabels(facilities: CourtFacility[]) {
  return facilities.map((facility) => ({
    type: facility,
    label: COURT_FACILITY_LABELS[facility] ?? facility,
  }));
}

export function mapPublicCourtDetail(
  court: PublicCourtDetailRecord,
  operatingHours: OperatingHoursLike[],
  priceRules: PriceRuleLike[],
) {
  return {
    id: court.id,
    name: court.name,
    sportType: court.sportType,
    sportLabel: formatSportTypeLabel(court.sportType),
    description: court.description,
    imageUrls: court.imageUrls,
    facilities: mapFacilityLabels(court.facilities),
    startingPrice: resolveStartingPrice(priceRules),
    openHours: buildOpenHoursFromWindows(operatingHours),
    gor: court.gor,
  };
}
