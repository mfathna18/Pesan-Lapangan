import type { PublicCourtRecord } from "@/domains/booking/repositories/court-repository";
import {
  buildOpenHoursFromWindows,
  formatSportTypeLabel,
} from "@/domains/booking/utils/court-display";
import type { PublicGorRecord } from "@/domains/owner/types";
import type { PublicVenueData } from "@/domains/venue/types";

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
  const activeOperatingHours = activeCourts.flatMap((court) =>
    court.operatingHours.filter((window) => window.isActive),
  );

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
      label: formatSportTypeLabel(type),
    })),
    courts: sortedCourts.map((court) => ({
      id: court.id,
      name: court.name,
      sportType: court.sportType,
      sportLabel: formatSportTypeLabel(court.sportType),
      isActive: court.isActive,
    })),
    openHours: buildOpenHoursFromWindows(activeOperatingHours),
  };
}
