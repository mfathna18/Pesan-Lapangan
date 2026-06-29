import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import { CourtNotFoundError } from "@/domains/booking/errors";
import {
  CourtRepository,
  type PublicCourtRecord,
} from "@/domains/booking/repositories/court-repository";
import { PriceRuleRepository } from "@/domains/booking/repositories/price-rule-repository";
import type { PublicCourtDetailData } from "@/domains/booking/types";
import { mapPublicCourtDetail } from "@/domains/booking/utils/court-display";

type CourtServiceDependencies = {
  courtRepository: CourtRepository;
  operatingHoursRepository: ReturnType<typeof createOperatingHoursRepository>;
  priceRuleRepository: PriceRuleRepository;
};

export class CourtService {
  private readonly courtRepository: CourtRepository;
  private readonly operatingHoursRepository: ReturnType<
    typeof createOperatingHoursRepository
  >;
  private readonly priceRuleRepository: PriceRuleRepository;

  constructor({
    courtRepository,
    operatingHoursRepository,
    priceRuleRepository,
  }: CourtServiceDependencies) {
    this.courtRepository = courtRepository;
    this.operatingHoursRepository = operatingHoursRepository;
    this.priceRuleRepository = priceRuleRepository;
  }

  async getPublicCourtsForGor(gorId: string): Promise<PublicCourtRecord[]> {
    return this.courtRepository.findPublicCourtsByGorId(gorId);
  }

  async getPublicCourtDetail(
    gorSlug: string,
    courtId: string,
  ): Promise<PublicCourtDetailData> {
    const court = await this.courtRepository.findPublicCourtDetailByGorSlug(
      courtId,
      gorSlug,
    );

    if (!court) {
      throw new CourtNotFoundError(`Court not found: ${courtId}`);
    }

    const [operatingHours, priceRules] = await Promise.all([
      this.operatingHoursRepository.findActiveByCourt(courtId),
      this.priceRuleRepository.findActiveByCourt(courtId),
    ]);

    return mapPublicCourtDetail(court, operatingHours, priceRules);
  }
}

export function createCourtService(
  dependencies: CourtServiceDependencies,
): CourtService {
  return new CourtService(dependencies);
}
