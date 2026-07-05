import { BOOKING_INTERVAL_MINUTES } from "@/domains/availability/constants";
import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import {
  createPrismaBookingReader,
  type BookingReader,
} from "@/domains/availability/readers/booking-reader";
import type {
  AvailabilitySlot,
  GetAvailabilityParams,
} from "@/domains/availability/types";
import {
  mapActivePriceRulesForDay,
  mapOperatingHoursForDay,
} from "@/domains/availability/utils/operating-hours";
import { buildAvailabilitySlotGridForDate } from "@/domains/availability/utils/slots";
import { getDayOfWeek } from "@/domains/availability/utils/time-interval";
import { GOR_DEFAULT_TIMEZONE } from "@/domains/owner/constants";
import {
  CourtRepository,
  createCourtRepository,
} from "@/domains/booking/repositories/court-repository";
import {
  createPriceRuleRepository,
  PriceRuleRepository,
} from "@/domains/booking/repositories/price-rule-repository";
import type { OperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import type { PrismaClient } from "@/generated/prisma/client";

type AvailabilityServiceDependencies = {
  courtRepository: CourtRepository;
  operatingHoursRepository: OperatingHoursRepository;
  priceRuleRepository: PriceRuleRepository;
  bookingReader: BookingReader;
};

export class AvailabilityService {
  private readonly courtRepository: CourtRepository;
  private readonly operatingHoursRepository: OperatingHoursRepository;
  private readonly priceRuleRepository: PriceRuleRepository;
  private readonly bookingReader: BookingReader;

  constructor({
    courtRepository,
    operatingHoursRepository,
    priceRuleRepository,
    bookingReader,
  }: AvailabilityServiceDependencies) {
    this.courtRepository = courtRepository;
    this.operatingHoursRepository = operatingHoursRepository;
    this.priceRuleRepository = priceRuleRepository;
    this.bookingReader = bookingReader;
  }

  async getSlotGrid(
    params: GetAvailabilityParams,
  ): Promise<AvailabilitySlot[]> {
    const court = await this.courtRepository.findActiveCourtWithGor(
      params.courtId,
    );

    if (!court) {
      return [];
    }

    const dayOfWeek = getDayOfWeek(params.date);
    const [operatingHours, priceRules, existingBookings] = await Promise.all([
      this.operatingHoursRepository.findActiveByCourtAndDay(
        params.courtId,
        dayOfWeek,
      ),
      this.priceRuleRepository.findActiveByCourtAndDay(
        params.courtId,
        dayOfWeek,
      ),
      this.bookingReader.findByCourtAndDate(params.courtId, params.date),
    ]);

    const operatingWindows = mapOperatingHoursForDay(operatingHours, dayOfWeek);
    const pricedWindows = mapActivePriceRulesForDay(priceRules, dayOfWeek);

    return buildAvailabilitySlotGridForDate(
      operatingWindows,
      pricedWindows,
      existingBookings,
      {
        bookingDate: params.date,
        timezone: court.gor.timezone || GOR_DEFAULT_TIMEZONE,
      },
    );
  }

  async getAvailableSlots(
    params: GetAvailabilityParams,
  ): Promise<AvailabilitySlot[]> {
    const slots = await this.getSlotGrid(params);

    return slots.filter((slot) => slot.available);
  }
}

export function createAvailabilityService(
  prisma: PrismaClient,
  dependencies?: Partial<AvailabilityServiceDependencies>,
): AvailabilityService {
  return new AvailabilityService({
    courtRepository:
      dependencies?.courtRepository ?? createCourtRepository(prisma),
    operatingHoursRepository:
      dependencies?.operatingHoursRepository ??
      createOperatingHoursRepository(prisma),
    priceRuleRepository:
      dependencies?.priceRuleRepository ?? createPriceRuleRepository(prisma),
    bookingReader:
      dependencies?.bookingReader ?? createPrismaBookingReader(prisma),
  });
}

export { BOOKING_INTERVAL_MINUTES };
