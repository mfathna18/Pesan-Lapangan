import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import {
  CourtNotFoundError,
  CourtValidationError,
} from "@/domains/booking/errors";
import {
  CourtRepository,
  type PublicCourtRecord,
} from "@/domains/booking/repositories/court-repository";
import { PriceRuleRepository } from "@/domains/booking/repositories/price-rule-repository";
import type {
  CreateOwnerCourtInput,
  OwnerCourtListItem,
  PublicCourtDetailData,
  UpdateOwnerCourtInput,
} from "@/domains/booking/types";
import {
  formatSportTypeLabel,
  mapPublicCourtDetail,
} from "@/domains/booking/utils/court-display";
import { GorRepository } from "@/domains/owner/repositories/gor-repository";
import type { SubscriptionRepository } from "@/domains/subscription/repositories/subscription-repository";
import {
  canCreateCourt,
  SUBSCRIPTION_COURT_LIMIT_REACHED_MESSAGE,
} from "@/domains/subscription/utils/subscription-plan-limits";
import type { SportType } from "@/generated/prisma/client";

type CourtServiceDependencies = {
  courtRepository: CourtRepository;
  operatingHoursRepository: ReturnType<typeof createOperatingHoursRepository>;
  priceRuleRepository: PriceRuleRepository;
  gorRepository: GorRepository;
  subscriptionRepository: SubscriptionRepository;
};

export class CourtService {
  private readonly courtRepository: CourtRepository;
  private readonly operatingHoursRepository: ReturnType<
    typeof createOperatingHoursRepository
  >;
  private readonly priceRuleRepository: PriceRuleRepository;
  private readonly gorRepository: GorRepository;
  private readonly subscriptionRepository: SubscriptionRepository;

  constructor({
    courtRepository,
    operatingHoursRepository,
    priceRuleRepository,
    gorRepository,
    subscriptionRepository,
  }: CourtServiceDependencies) {
    this.courtRepository = courtRepository;
    this.operatingHoursRepository = operatingHoursRepository;
    this.priceRuleRepository = priceRuleRepository;
    this.gorRepository = gorRepository;
    this.subscriptionRepository = subscriptionRepository;
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

  async listCourtsForOwner(ownerId: string): Promise<OwnerCourtListItem[]> {
    const courts = await this.courtRepository.findAllByOwnerId(ownerId);

    return courts.map((court) => this.toOwnerCourtListItem(court));
  }

  async createCourtForOwner(
    ownerId: string,
    input: CreateOwnerCourtInput,
  ): Promise<OwnerCourtListItem> {
    const gorId = await this.gorRepository.findGorIdByOwnerId(ownerId);

    if (!gorId) {
      throw new CourtValidationError(
        "Lengkapi profil GOR di Pengaturan sebelum menambahkan lapangan.",
      );
    }

    const name = input.name.trim();

    if (!name) {
      throw new CourtValidationError("Court name is required.");
    }

    await this.assertCanCreateCourt(ownerId);

    const displayOrder =
      (await this.courtRepository.getMaxDisplayOrderForGor(gorId)) + 1;

    const court = await this.courtRepository.createForGor(gorId, {
      name,
      sportType: input.sportType as SportType,
      isActive: input.isActive,
      displayOrder,
    });

    return this.toOwnerCourtListItem(court);
  }

  async updateCourtForOwner(
    ownerId: string,
    courtId: string,
    input: UpdateOwnerCourtInput,
  ): Promise<OwnerCourtListItem> {
    const name = input.name.trim();

    if (!name) {
      throw new CourtValidationError("Court name is required.");
    }

    const court = await this.courtRepository.updateForOwner(courtId, ownerId, {
      name,
      sportType: input.sportType as SportType,
      isActive: input.isActive,
    });

    if (!court) {
      throw new CourtNotFoundError();
    }

    return this.toOwnerCourtListItem(court);
  }

  async setCourtActiveForOwner(
    ownerId: string,
    courtId: string,
    isActive: boolean,
  ): Promise<OwnerCourtListItem> {
    const court = await this.courtRepository.setActiveForOwner(
      courtId,
      ownerId,
      isActive,
    );

    if (!court) {
      throw new CourtNotFoundError();
    }

    return this.toOwnerCourtListItem(court);
  }

  async deleteCourtForOwner(ownerId: string, courtId: string): Promise<void> {
    const deleted = await this.courtRepository.deleteForOwner(courtId, ownerId);

    if (!deleted) {
      throw new CourtNotFoundError();
    }
  }

  private async assertCanCreateCourt(ownerId: string): Promise<void> {
    let subscription = await this.subscriptionRepository.findByOwnerId(ownerId);

    if (!subscription) {
      subscription =
        await this.subscriptionRepository.createDefaultForOwner(ownerId);
    }

    const currentCourtCount =
      await this.courtRepository.countByOwnerId(ownerId);

    if (
      !canCreateCourt({
        plan: subscription.plan,
        currentCourtCount,
      })
    ) {
      throw new CourtValidationError(SUBSCRIPTION_COURT_LIMIT_REACHED_MESSAGE);
    }
  }

  private toOwnerCourtListItem(court: {
    id: string;
    name: string;
    sportType: string;
    isActive: boolean;
    displayOrder: number;
  }): OwnerCourtListItem {
    return {
      id: court.id,
      name: court.name,
      sportType: court.sportType,
      sportLabel: formatSportTypeLabel(court.sportType),
      isActive: court.isActive,
      displayOrder: court.displayOrder,
    };
  }
}

export function createCourtService(
  dependencies: CourtServiceDependencies,
): CourtService {
  return new CourtService(dependencies);
}
