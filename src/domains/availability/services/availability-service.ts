import { BOOKING_INTERVAL_MINUTES } from "@/domains/availability/constants";
import {
  createPrismaBookingReader,
  type BookingReader,
} from "@/domains/availability/readers/booking-reader";
import type {
  AvailableSlot,
  GetAvailabilityParams,
  OperatingHoursWindow,
  PriceRuleWindow,
} from "@/domains/availability/types";
import {
  deriveOperatingHoursFromPriceRules,
  mapActivePriceRulesForDay,
  resolveSlotPrice,
} from "@/domains/availability/utils/operating-hours";
import {
  dedupeSlotsByStartMinute,
  excludeOverlappingSlots,
  generateFixedIntervalSlots,
  getDayOfWeek,
} from "@/domains/availability/utils/time-interval";
import type { PrismaClient } from "@/generated/prisma/client";

type AvailabilityServiceDependencies = {
  prisma: PrismaClient;
  bookingReader?: BookingReader;
};

export class AvailabilityService {
  private readonly prisma: PrismaClient;
  private readonly bookingReader: BookingReader;

  constructor({ prisma, bookingReader }: AvailabilityServiceDependencies) {
    this.prisma = prisma;
    this.bookingReader = bookingReader ?? createPrismaBookingReader(prisma);
  }

  async getAvailableSlots(
    params: GetAvailabilityParams,
  ): Promise<AvailableSlot[]> {
    const court = await this.prisma.court.findFirst({
      where: {
        id: params.courtId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!court) {
      return [];
    }

    const dayOfWeek = getDayOfWeek(params.date);
    const priceRules = await this.readPriceRules(params.courtId, dayOfWeek);
    const operatingHours = this.readOperatingHours(priceRules, dayOfWeek);
    const pricedWindows = mapActivePriceRulesForDay(priceRules, dayOfWeek);
    const existingBookings = await this.bookingReader.findByCourtAndDate(
      params.courtId,
      params.date,
    );

    const candidateSlots = this.generateCandidateSlots(
      operatingHours,
      pricedWindows,
    );

    return excludeOverlappingSlots(candidateSlots, existingBookings);
  }

  private async readPriceRules(courtId: string, dayOfWeek: number) {
    return this.prisma.priceRule.findMany({
      where: {
        courtId,
        dayOfWeek,
        isActive: true,
      },
      select: {
        dayOfWeek: true,
        startMinute: true,
        endMinute: true,
        price: true,
        isActive: true,
      },
      orderBy: {
        startMinute: "asc",
      },
    });
  }

  private readOperatingHours(
    priceRules: Awaited<ReturnType<AvailabilityService["readPriceRules"]>>,
    dayOfWeek: number,
  ): OperatingHoursWindow[] {
    return deriveOperatingHoursFromPriceRules(priceRules, dayOfWeek);
  }

  private generateCandidateSlots(
    operatingHours: OperatingHoursWindow[],
    priceRules: PriceRuleWindow[],
  ): AvailableSlot[] {
    const hourlySlots = operatingHours.flatMap((window) =>
      generateFixedIntervalSlots(window, BOOKING_INTERVAL_MINUTES),
    );

    const pricedSlots = dedupeSlotsByStartMinute(hourlySlots).flatMap(
      (slot) => {
        const price = resolveSlotPrice(slot, priceRules);

        if (price === null) {
          return [];
        }

        return [{ ...slot, price }];
      },
    );

    return pricedSlots;
  }
}

export function createAvailabilityService(
  prisma: PrismaClient,
  bookingReader?: BookingReader,
): AvailabilityService {
  return new AvailabilityService({ prisma, bookingReader });
}
