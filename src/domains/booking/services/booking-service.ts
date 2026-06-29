import { ANALYTICS_TOP_COURTS_LIMIT } from "@/domains/booking/constants";
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
import { generateBookingNumber } from "@/domains/booking/utils/booking-number";
import { resolveBookingPaymentDisplayStatus } from "@/domains/booking/utils/booking-display";
import { validateCreateBookingRequest } from "@/domains/booking/utils/validation";
import {
  endOfMonth,
  startOfMonth,
} from "@/domains/payment/utils/revenue-date-range";
import type { SubscriptionAccessReader } from "@/domains/subscription/readers/subscription-access-reader";
import { createSubscriptionAccessReader } from "@/domains/subscription/readers/subscription-access-reader";
import { SubscriptionAccessDeniedError } from "@/domains/subscription/errors";
import type { PrismaClient } from "@/generated/prisma/client";

type BookingServiceDependencies = {
  bookingRepository: BookingRepository;
  priceRuleRepository: PriceRuleRepository;
  courtRepository: CourtRepository;
  subscriptionAccessReader: SubscriptionAccessReader;
};

export class BookingService {
  private readonly bookingRepository: BookingRepository;
  private readonly priceRuleRepository: PriceRuleRepository;
  private readonly courtRepository: CourtRepository;
  private readonly subscriptionAccessReader: SubscriptionAccessReader;

  constructor({
    bookingRepository,
    priceRuleRepository,
    courtRepository,
    subscriptionAccessReader,
  }: BookingServiceDependencies) {
    this.bookingRepository = bookingRepository;
    this.priceRuleRepository = priceRuleRepository;
    this.courtRepository = courtRepository;
    this.subscriptionAccessReader = subscriptionAccessReader;
  }

  async create(input: CreateBookingRequest): Promise<BookingWithContact> {
    const { endMinute, dayOfWeek } = validateCreateBookingRequest(input);

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

  async getBookingDetail(id: string): Promise<BookingDetail> {
    const booking = await this.bookingRepository.findDetailById(id);

    if (!booking) {
      throw new BookingNotFoundError(`Booking not found: ${id}`);
    }

    return this.toBookingDetail(booking);
  }

  async getFilterOptions(): Promise<BookingFilterOptions> {
    const courts = await this.courtRepository.findActiveCourts();

    return { courts };
  }

  async getAnalyticsDashboard(
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardData> {
    const periodStart = startOfMonth(referenceDate);
    const periodEnd = endOfMonth(referenceDate);

    const snapshot = await this.bookingRepository.fetchAnalyticsSnapshot({
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
    const paidPayment =
      booking.payments.find((payment) => payment.status === "PAID") ??
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
      payment: paidPayment
        ? {
            id: paidPayment.id,
            amount: paidPayment.amount,
            status: paidPayment.status,
            method: paidPayment.method,
            externalReference: paidPayment.externalReference,
            paidAt: paidPayment.paidAt?.toISOString() ?? null,
            expiredAt: paidPayment.expiredAt?.toISOString() ?? null,
            createdAt: paidPayment.createdAt.toISOString(),
          }
        : null,
      invoice: paidPayment?.invoice
        ? {
            id: paidPayment.invoice.id,
            invoiceNumber: paidPayment.invoice.invoiceNumber,
            status: paidPayment.invoice.status,
            totalAmountSnapshot: paidPayment.invoice.totalAmountSnapshot,
            generatedAt: paidPayment.invoice.generatedAt.toISOString(),
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

  return new BookingService({
    bookingRepository,
    priceRuleRepository,
    courtRepository,
    subscriptionAccessReader,
  });
}
