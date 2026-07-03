import {
  ANALYTICS_TOP_COURTS_LIMIT,
  BOOKING_SLOT_UNAVAILABLE_MESSAGE,
} from "@/domains/booking/constants";
import {
  BookingNotFoundError,
  BookingValidationError,
} from "@/domains/booking/errors";
import {
  BookingRepository,
  type BookingDetailRecord,
  type BookingWithContact,
  type BookingWithContactAndPayments,
} from "@/domains/booking/repositories/booking-repository";
import {
  CourtRepository,
  type CourtForBooking,
} from "@/domains/booking/repositories/court-repository";
import { PriceRuleRepository } from "@/domains/booking/repositories/price-rule-repository";
import type { CreateBookingRequest } from "@/domains/booking/services/booking-service.types";
import type {
  AnalyticsDashboardData,
  BookingDetail,
  BookingFilterOptions,
  BookingListItem,
  ListBookingsInput,
  ListBookingsResult,
} from "@/domains/booking/types";
import { buildAnalyticsDashboard } from "@/domains/booking/utils/analytics";
import { buildAvailabilityBlockingBookingWhere } from "@/domains/booking/utils/booking-expiration";
import { generateBookingNumber } from "@/domains/booking/utils/booking-number";
import {
  buildHourlyIntervals,
  resolveRangeTotalPrice,
} from "@/domains/booking/utils/booking-range";
import { resolveBookingPaymentDisplayStatus } from "@/domains/booking/utils/booking-display";
import { acquireCourtBookingDateLock } from "@/domains/booking/utils/court-booking-lock";
import { slotConflictsWithBookings } from "@/domains/booking/utils/slot-availability";
import { validateCreateBookingRequest } from "@/domains/booking/utils/validation";
import {
  AvailabilityService,
  createAvailabilityService,
} from "@/domains/availability/services/availability-service";
import { startOfDay } from "@/domains/availability/utils/time-interval";
import {
  endOfMonth,
  startOfMonth,
} from "@/domains/payment/utils/revenue-date-range";
import type { SubscriptionAccessReader } from "@/domains/subscription/readers/subscription-access-reader";
import { createSubscriptionAccessReader } from "@/domains/subscription/readers/subscription-access-reader";
import { SubscriptionAccessDeniedError } from "@/domains/subscription/errors";
import type { PrismaClient } from "@/generated/prisma/client";

type BookingServiceDependencies = {
  prisma: PrismaClient;
  bookingRepository: BookingRepository;
  priceRuleRepository: PriceRuleRepository;
  courtRepository: CourtRepository;
  subscriptionAccessReader: SubscriptionAccessReader;
  availabilityService: AvailabilityService;
};

export class BookingService {
  private readonly prisma: PrismaClient;
  private readonly bookingRepository: BookingRepository;
  private readonly priceRuleRepository: PriceRuleRepository;
  private readonly courtRepository: CourtRepository;
  private readonly subscriptionAccessReader: SubscriptionAccessReader;
  private readonly availabilityService: AvailabilityService;

  constructor({
    prisma,
    bookingRepository,
    priceRuleRepository,
    courtRepository,
    subscriptionAccessReader,
    availabilityService,
  }: BookingServiceDependencies) {
    this.prisma = prisma;
    this.bookingRepository = bookingRepository;
    this.priceRuleRepository = priceRuleRepository;
    this.courtRepository = courtRepository;
    this.subscriptionAccessReader = subscriptionAccessReader;
    this.availabilityService = availabilityService;
  }

  async create(input: CreateBookingRequest): Promise<BookingWithContact> {
    const { endMinute, durationMinute, dayOfWeek } =
      validateCreateBookingRequest(input);

    const court = await this.courtRepository.findActiveCourtWithGor(
      input.courtId,
    );

    this.ensureCourtAndGorAreActive(court, input.courtId);

    try {
      await this.subscriptionAccessReader.assertCanReceiveBookings(
        input.courtId,
      );
    } catch (error) {
      if (error instanceof SubscriptionAccessDeniedError) {
        throw new BookingValidationError(error.message);
      }

      throw error;
    }

    const slotGrid = await this.availabilityService.getSlotGrid({
      courtId: input.courtId,
      date: input.bookingDate,
    });
    const availabilityTotalPrice = resolveRangeTotalPrice(
      slotGrid,
      input.startMinute,
      endMinute,
    );

    if (availabilityTotalPrice === null) {
      throw new BookingValidationError(BOOKING_SLOT_UNAVAILABLE_MESSAGE);
    }

    const hourlyIntervals = buildHourlyIntervals(input.startMinute, endMinute);
    let totalPrice = 0;
    let firstHourPrice: number | null = null;

    for (const interval of hourlyIntervals) {
      const priceRule = await this.priceRuleRepository.findMatchingRule({
        courtId: input.courtId,
        dayOfWeek,
        startMinute: interval.startMinute,
        endMinute: interval.endMinute,
      });

      if (!priceRule) {
        throw new BookingValidationError(
          "No active price rule matches the requested booking window.",
        );
      }

      if (firstHourPrice === null) {
        firstHourPrice = priceRule.price;
      }

      totalPrice += priceRule.price;
    }

    if (totalPrice !== availabilityTotalPrice) {
      throw new BookingValidationError(BOOKING_SLOT_UNAVAILABLE_MESSAGE);
    }

    const bookingNumber = await generateBookingNumber(
      input.bookingDate,
      this.bookingRepository,
    );

    const createInput = {
      courtId: court.id,
      bookingNumber,
      bookingDate: input.bookingDate,
      startMinute: input.startMinute,
      endMinute,
      durationMinute,
      totalPrice,
      gorNameSnapshot: court.gor.name,
      courtNameSnapshot: court.name,
      sportTypeSnapshot: court.sportType,
      pricePerHourSnapshot: firstHourPrice ?? totalPrice,
      contact: input.contact,
    };

    const requestedSlot = {
      startMinute: input.startMinute,
      endMinute,
    };

    return this.prisma.$transaction(async (tx) => {
      await acquireCourtBookingDateLock(tx, court.id, input.bookingDate);

      const referenceDate = new Date();

      const existingBookings = await tx.booking.findMany({
        where: {
          courtId: court.id,
          bookingDate: startOfDay(input.bookingDate),
          ...buildAvailabilityBlockingBookingWhere(referenceDate),
        },
        select: {
          startMinute: true,
          endMinute: true,
        },
      });

      if (slotConflictsWithBookings(requestedSlot, existingBookings)) {
        throw new BookingValidationError(BOOKING_SLOT_UNAVAILABLE_MESSAGE);
      }

      return new BookingRepository(tx).create(createInput);
    });
  }

  async listBookings(input: ListBookingsInput): Promise<ListBookingsResult> {
    const { items, total } =
      await this.bookingRepository.findManyWithFilters(input);
    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));

    return {
      items: items.map((booking) => this.toBookingListItem(booking)),
      total,
      page: input.page,
      pageSize: input.pageSize,
      totalPages,
    };
  }

  async getBookingDetail(id: string, ownerId: string): Promise<BookingDetail> {
    const booking = await this.bookingRepository.findDetailById(id, ownerId);

    if (!booking) {
      throw new BookingNotFoundError(`Booking not found: ${id}`);
    }

    return this.toBookingDetail(booking);
  }

  async getFilterOptions(ownerId: string): Promise<BookingFilterOptions> {
    const courts =
      await this.courtRepository.findActiveCourtsByOwnerId(ownerId);

    return { courts };
  }

  async getAnalyticsDashboard(
    ownerId: string,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardData> {
    const periodStart = startOfMonth(referenceDate);
    const periodEnd = endOfMonth(referenceDate);

    const snapshot = await this.bookingRepository.fetchAnalyticsSnapshot({
      ownerId,
      periodStart,
      periodEnd,
    });

    return buildAnalyticsDashboard(
      snapshot,
      periodStart,
      periodEnd,
      ANALYTICS_TOP_COURTS_LIMIT,
    );
  }

  private toBookingListItem(
    booking: BookingWithContactAndPayments,
  ): BookingListItem {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      customerName: booking.contact?.customerName ?? "-",
      courtName: booking.courtNameSnapshot,
      bookingDate: booking.bookingDate.toISOString(),
      startMinute: booking.startMinute,
      endMinute: booking.endMinute,
      bookingStatus: booking.status,
      paymentStatus: resolveBookingPaymentDisplayStatus(booking.payments),
      createdAt: booking.createdAt.toISOString(),
    };
  }

  private toBookingDetail(booking: BookingDetailRecord): BookingDetail {
    const detailPayment =
      booking.payments.find(
        (payment) => payment.status === "AWAITING_CONFIRMATION",
      ) ??
      booking.payments.find((payment) => payment.status === "PAID") ??
      booking.payments.find((payment) => payment.status === "PENDING") ??
      booking.payments.find((payment) => payment.status === "REJECTED") ??
      booking.payments[0] ??
      null;

    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingDate: booking.bookingDate.toISOString(),
      startMinute: booking.startMinute,
      endMinute: booking.endMinute,
      durationMinute: booking.durationMinute,
      totalPrice: booking.totalPrice,
      status: booking.status,
      gorNameSnapshot: booking.gorNameSnapshot,
      courtNameSnapshot: booking.courtNameSnapshot,
      sportTypeSnapshot: booking.sportTypeSnapshot,
      pricePerHourSnapshot: booking.pricePerHourSnapshot,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      contact: booking.contact
        ? {
            customerName: booking.contact.customerName,
            customerPhone: booking.contact.customerPhone,
            note: booking.contact.note,
          }
        : null,
      payment: detailPayment
        ? {
            id: detailPayment.id,
            amount: detailPayment.amount,
            status: detailPayment.status,
            method: detailPayment.method,
            externalReference: detailPayment.externalReference,
            paidAt: detailPayment.paidAt?.toISOString() ?? null,
            expiredAt: detailPayment.expiredAt?.toISOString() ?? null,
            customerConfirmedAt:
              detailPayment.customerConfirmedAt?.toISOString() ?? null,
            rejectionReason: detailPayment.rejectionReason,
            createdAt: detailPayment.createdAt.toISOString(),
          }
        : null,
      invoice: detailPayment?.invoice
        ? {
            id: detailPayment.invoice.id,
            invoiceNumber: detailPayment.invoice.invoiceNumber,
            status: detailPayment.invoice.status,
            totalAmountSnapshot: detailPayment.invoice.totalAmountSnapshot,
            generatedAt: detailPayment.invoice.generatedAt.toISOString(),
          }
        : null,
    };
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
  const subscriptionAccessReader =
    dependencies?.subscriptionAccessReader ??
    createSubscriptionAccessReader(prisma);
  const availabilityService =
    dependencies?.availabilityService ?? createAvailabilityService(prisma);

  return new BookingService({
    prisma,
    bookingRepository,
    priceRuleRepository,
    courtRepository,
    subscriptionAccessReader,
    availabilityService,
  });
}
