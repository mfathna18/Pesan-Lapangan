import { BookingValidationError } from "@/domains/booking/errors";
import {
  BookingRepository,
  type BookingWithContact,
} from "@/domains/booking/repositories/booking-repository";
import {
  CourtRepository,
  type CourtForBooking,
} from "@/domains/booking/repositories/court-repository";
import { PriceRuleRepository } from "@/domains/booking/repositories/price-rule-repository";
import type { CreateBookingRequest } from "@/domains/booking/services/booking-service.types";
import { generateBookingNumber } from "@/domains/booking/utils/booking-number";
import { validateCreateBookingRequest } from "@/domains/booking/utils/validation";
import type { PrismaClient } from "@/generated/prisma/client";

type BookingServiceDependencies = {
  bookingRepository: BookingRepository;
  priceRuleRepository: PriceRuleRepository;
  courtRepository: CourtRepository;
};

export class BookingService {
  private readonly bookingRepository: BookingRepository;
  private readonly priceRuleRepository: PriceRuleRepository;
  private readonly courtRepository: CourtRepository;

  constructor({
    bookingRepository,
    priceRuleRepository,
    courtRepository,
  }: BookingServiceDependencies) {
    this.bookingRepository = bookingRepository;
    this.priceRuleRepository = priceRuleRepository;
    this.courtRepository = courtRepository;
  }

  async create(input: CreateBookingRequest): Promise<BookingWithContact> {
    const { endMinute, dayOfWeek } = validateCreateBookingRequest(input);

    const court = await this.courtRepository.findActiveCourtWithGor(
      input.courtId,
    );

    this.ensureCourtAndGorAreActive(court, input.courtId);

    const priceRule = await this.priceRuleRepository.findMatchingRule({
      courtId: input.courtId,
      dayOfWeek,
      startMinute: input.startMinute,
      endMinute,
    });

    if (!priceRule) {
      throw new BookingValidationError(
        "No active price rule matches the requested booking window.",
      );
    }

    const bookingNumber = await generateBookingNumber(
      input.bookingDate,
      this.bookingRepository,
    );

    const hourlyPrice = priceRule.price;

    return this.bookingRepository.create({
      courtId: court.id,
      bookingNumber,
      bookingDate: input.bookingDate,
      startMinute: input.startMinute,
      endMinute,
      durationMinute: input.durationMinute,
      totalPrice: hourlyPrice,
      gorNameSnapshot: court.gor.id,
      courtNameSnapshot: court.name,
      sportTypeSnapshot: court.sportType,
      pricePerHourSnapshot: hourlyPrice,
      contact: input.contact,
    });
  }

  private ensureCourtAndGorAreActive(
    court: CourtForBooking | null,
    courtId: string,
  ): asserts court is CourtForBooking {
    if (!court) {
      throw new BookingValidationError(
        `Court ${courtId} is unavailable or its GOR is inactive.`,
      );
    }

    if (!court.isActive) {
      throw new BookingValidationError("Court must be active.");
    }
  }
}

export function createBookingService(
  prisma: PrismaClient,
  dependencies?: Partial<BookingServiceDependencies>,
): BookingService {
  const bookingRepository =
    dependencies?.bookingRepository ?? new BookingRepository(prisma);
  const priceRuleRepository =
    dependencies?.priceRuleRepository ?? new PriceRuleRepository(prisma);
  const courtRepository =
    dependencies?.courtRepository ?? new CourtRepository(prisma);

  return new BookingService({
    bookingRepository,
    priceRuleRepository,
    courtRepository,
  });
}
