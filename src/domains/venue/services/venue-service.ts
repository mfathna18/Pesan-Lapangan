import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import { GorNotFoundError } from "@/domains/owner/errors";
import type { GorService } from "@/domains/owner/services/gor-service";
import type { CourtService } from "@/domains/booking/services/court-service";
import { VenueNotFoundError } from "@/domains/venue/errors";
import type { PublicVenueData } from "@/domains/venue/types";
import { mapGorAndCourtsToPublicVenue } from "@/domains/venue/utils/venue-mapper";
import { createCourtRepository } from "@/domains/booking/repositories/court-repository";
import { createPriceRuleRepository } from "@/domains/booking/repositories/price-rule-repository";
import { createCourtService } from "@/domains/booking/services/court-service";
import { createGorRepository } from "@/domains/owner/repositories/gor-repository";
import { createGorService } from "@/domains/owner/services/gor-service";
import type { PrismaClient } from "@/generated/prisma/client";

type VenueServiceDependencies = {
  gorService: GorService;
  courtService: CourtService;
};

export class VenueService {
  private readonly gorService: GorService;
  private readonly courtService: CourtService;

  constructor({ gorService, courtService }: VenueServiceDependencies) {
    this.gorService = gorService;
    this.courtService = courtService;
  }

  async getPublicVenueBySlug(slug: string): Promise<PublicVenueData> {
    try {
      const gor = await this.gorService.getPublicGorBySlug(slug);
      const courts = await this.courtService.getPublicCourtsForGor(gor.id);

      return mapGorAndCourtsToPublicVenue(gor, courts);
    } catch (error) {
      if (error instanceof GorNotFoundError) {
        throw new VenueNotFoundError(error.message);
      }

      throw error;
    }
  }
}

export function createVenueService(prisma: PrismaClient): VenueService {
  const gorRepository = createGorRepository(prisma);
  const courtRepository = createCourtRepository(prisma);

  return new VenueService({
    gorService: createGorService(gorRepository),
    courtService: createCourtService({
      courtRepository,
      operatingHoursRepository: createOperatingHoursRepository(prisma),
      priceRuleRepository: createPriceRuleRepository(prisma),
    }),
  });
}
