import { CourtRepository } from "@/domains/booking/repositories/court-repository";
import type { PublicCourtRecord } from "@/domains/booking/repositories/court-repository";

export class CourtService {
  constructor(private readonly courtRepository: CourtRepository) {}

  async getPublicCourtsForGor(gorId: string): Promise<PublicCourtRecord[]> {
    return this.courtRepository.findPublicCourtsByGorId(gorId);
  }
}

export function createCourtService(
  courtRepository: CourtRepository,
): CourtService {
  return new CourtService(courtRepository);
}
