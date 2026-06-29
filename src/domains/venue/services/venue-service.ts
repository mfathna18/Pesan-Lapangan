import { VenueNotFoundError } from "@/domains/venue/errors";
import { VenueRepository } from "@/domains/venue/repositories/venue-repository";
import type { PublicVenueData } from "@/domains/venue/types";
import { mapVenueRecordToPublicVenue } from "@/domains/venue/utils/venue-mapper";
import type { PrismaClient } from "@/generated/prisma/client";

type VenueServiceDependencies = {
  venueRepository: VenueRepository;
};

export class VenueService {
  private readonly venueRepository: VenueRepository;

  constructor({ venueRepository }: VenueServiceDependencies) {
    this.venueRepository = venueRepository;
  }

  async getPublicVenueBySlug(slug: string): Promise<PublicVenueData> {
    const venue = await this.venueRepository.findPublicVenueBySlug(slug);

    if (!venue) {
      throw new VenueNotFoundError(`Venue not found: ${slug}`);
    }

    return mapVenueRecordToPublicVenue(venue);
  }
}

export function createVenueService(prisma: PrismaClient): VenueService {
  return new VenueService({
    venueRepository: new VenueRepository(prisma),
  });
}
