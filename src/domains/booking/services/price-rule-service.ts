import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import {
  CourtNotFoundError,
  PriceRuleNotFoundError,
} from "@/domains/booking/errors";
import type { CourtRepository } from "@/domains/booking/repositories/court-repository";
import {
  PriceRuleRepository,
  type OwnerPriceRuleRecord,
} from "@/domains/booking/repositories/price-rule-repository";
import type {
  OwnerPriceRuleListItem,
  SaveOwnerPriceRuleInput,
} from "@/domains/booking/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";
import {
  getWeekdayLabelForPriceRule,
  validateOwnerPriceRuleInput,
} from "@/domains/booking/utils/owner-price-rules";
import { minuteOfDayToTimeValue } from "@/domains/availability/utils/time-input";

type PriceRuleServiceDependencies = {
  priceRuleRepository: PriceRuleRepository;
  courtRepository: CourtRepository;
  operatingHoursRepository: ReturnType<typeof createOperatingHoursRepository>;
};

export class PriceRuleService {
  private readonly priceRuleRepository: PriceRuleRepository;
  private readonly courtRepository: CourtRepository;
  private readonly operatingHoursRepository: ReturnType<
    typeof createOperatingHoursRepository
  >;

  constructor({
    priceRuleRepository,
    courtRepository,
    operatingHoursRepository,
  }: PriceRuleServiceDependencies) {
    this.priceRuleRepository = priceRuleRepository;
    this.courtRepository = courtRepository;
    this.operatingHoursRepository = operatingHoursRepository;
  }

  async listRulesForOwnerCourt(
    ownerId: string,
    courtId: string,
  ): Promise<OwnerPriceRuleListItem[]> {
    await this.assertCourtOwnedByOwner(courtId, ownerId);

    const rules = await this.priceRuleRepository.findAllByCourt(courtId);

    return rules.map((rule) => this.toOwnerPriceRuleListItem(rule));
  }

  async createRuleForOwnerCourt(
    ownerId: string,
    courtId: string,
    input: SaveOwnerPriceRuleInput,
  ): Promise<OwnerPriceRuleListItem> {
    await this.assertCourtOwnedByOwner(courtId, ownerId);

    const [existingRules, operatingHours] = await Promise.all([
      this.priceRuleRepository.findAllByCourt(courtId),
      this.operatingHoursRepository.findByCourt(courtId),
    ]);

    const validated = validateOwnerPriceRuleInput(
      input,
      existingRules,
      operatingHours,
    );

    const rule = await this.priceRuleRepository.createForCourt(
      courtId,
      validated,
    );

    return this.toOwnerPriceRuleListItem(rule);
  }

  async updateRuleForOwnerCourt(
    ownerId: string,
    courtId: string,
    priceRuleId: string,
    input: SaveOwnerPriceRuleInput,
  ): Promise<OwnerPriceRuleListItem> {
    await this.assertCourtOwnedByOwner(courtId, ownerId);

    const [existingRules, operatingHours] = await Promise.all([
      this.priceRuleRepository.findAllByCourt(courtId),
      this.operatingHoursRepository.findByCourt(courtId),
    ]);

    const validated = validateOwnerPriceRuleInput(
      input,
      existingRules,
      operatingHours,
      priceRuleId,
    );

    const rule = await this.priceRuleRepository.updateForCourt(
      priceRuleId,
      courtId,
      validated,
    );

    if (!rule) {
      throw new PriceRuleNotFoundError();
    }

    return this.toOwnerPriceRuleListItem(rule);
  }

  async setRuleActiveForOwnerCourt(
    ownerId: string,
    courtId: string,
    priceRuleId: string,
    isActive: boolean,
  ): Promise<OwnerPriceRuleListItem> {
    await this.assertCourtOwnedByOwner(courtId, ownerId);

    const existingRule = await this.priceRuleRepository.findByIdForCourt(
      priceRuleId,
      courtId,
    );

    if (!existingRule) {
      throw new PriceRuleNotFoundError();
    }

    if (isActive) {
      const [existingRules, operatingHours] = await Promise.all([
        this.priceRuleRepository.findAllByCourt(courtId),
        this.operatingHoursRepository.findByCourt(courtId),
      ]);

      validateOwnerPriceRuleInput(
        {
          dayOfWeek: existingRule.dayOfWeek,
          startTime: minuteOfDayToTimeValue(existingRule.startMinute),
          endTime: minuteOfDayToTimeValue(existingRule.endMinute),
          price: existingRule.price,
          isActive: true,
        },
        existingRules,
        operatingHours,
        priceRuleId,
      );
    }

    const rule = await this.priceRuleRepository.setActiveForCourt(
      priceRuleId,
      courtId,
      isActive,
    );

    if (!rule) {
      throw new PriceRuleNotFoundError();
    }

    return this.toOwnerPriceRuleListItem(rule);
  }

  async deleteRuleForOwnerCourt(
    ownerId: string,
    courtId: string,
    priceRuleId: string,
  ): Promise<void> {
    await this.assertCourtOwnedByOwner(courtId, ownerId);

    const deleted = await this.priceRuleRepository.deleteForCourt(
      priceRuleId,
      courtId,
    );

    if (!deleted) {
      throw new PriceRuleNotFoundError();
    }
  }

  private async assertCourtOwnedByOwner(
    courtId: string,
    ownerId: string,
  ): Promise<void> {
    const isOwned = await this.courtRepository.isCourtOwnedByOwner(
      courtId,
      ownerId,
    );

    if (!isOwned) {
      throw new CourtNotFoundError();
    }
  }

  private toOwnerPriceRuleListItem(
    rule: OwnerPriceRuleRecord,
  ): OwnerPriceRuleListItem {
    return {
      id: rule.id,
      courtId: rule.courtId,
      dayOfWeek: rule.dayOfWeek,
      dayLabel: getWeekdayLabelForPriceRule(rule.dayOfWeek),
      startTime: minuteOfDayToTimeValue(rule.startMinute),
      endTime: minuteOfDayToTimeValue(rule.endMinute),
      price: rule.price,
      priceLabel: formatCurrency(rule.price),
      isActive: rule.isActive,
    };
  }
}

export function createPriceRuleService(
  dependencies: PriceRuleServiceDependencies,
): PriceRuleService {
  return new PriceRuleService(dependencies);
}
