import { CourtNotFoundError } from "@/domains/booking/errors";
import type { CourtRepository } from "@/domains/booking/repositories/court-repository";
import { OperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import type {
  OwnerOperatingHoursSchedule,
  SaveOwnerOperatingHoursInput,
} from "@/domains/availability/types";
import {
  buildOwnerOperatingHoursSchedule,
  validateOwnerOperatingHoursInput,
} from "@/domains/availability/utils/owner-operating-hours";

type OperatingHoursServiceDependencies = {
  operatingHoursRepository: OperatingHoursRepository;
  courtRepository: CourtRepository;
};

export class OperatingHoursService {
  private readonly operatingHoursRepository: OperatingHoursRepository;
  private readonly courtRepository: CourtRepository;

  constructor({
    operatingHoursRepository,
    courtRepository,
  }: OperatingHoursServiceDependencies) {
    this.operatingHoursRepository = operatingHoursRepository;
    this.courtRepository = courtRepository;
  }

  async getScheduleForOwnerCourt(
    ownerId: string,
    courtId: string,
  ): Promise<OwnerOperatingHoursSchedule> {
    await this.assertCourtOwnedByOwner(courtId, ownerId);

    const records = await this.operatingHoursRepository.findByCourt(courtId);

    return buildOwnerOperatingHoursSchedule(courtId, records);
  }

  async saveScheduleForOwnerCourt(
    ownerId: string,
    input: SaveOwnerOperatingHoursInput,
  ): Promise<OwnerOperatingHoursSchedule> {
    await this.assertCourtOwnedByOwner(input.courtId, ownerId);

    const validatedWindows = validateOwnerOperatingHoursInput(input.days);

    await this.operatingHoursRepository.replaceForCourt(
      input.courtId,
      validatedWindows,
    );

    return this.getScheduleForOwnerCourt(ownerId, input.courtId);
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
}

export function createOperatingHoursService(
  dependencies: OperatingHoursServiceDependencies,
): OperatingHoursService {
  return new OperatingHoursService(dependencies);
}
