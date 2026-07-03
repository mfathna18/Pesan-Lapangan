import { PublicCheckoutNotFoundError } from "@/domains/payment/errors";
import type { BookingRepository } from "@/domains/booking/repositories/booking-repository";
import { isBookingSlotHoldActive } from "@/domains/booking/utils/booking-expiration";
import { PAYMENT_STATUS } from "@/domains/payment/constants";
import type { PaymentRepository } from "@/domains/payment/repositories/payment-repository";
import type { PublicCheckoutData } from "@/domains/payment/types";
import { resolveCustomerPaymentDisplayStatus } from "@/domains/payment/utils/customer-payment-status";

type PublicCheckoutServiceDependencies = {
  bookingRepository: BookingRepository;
  paymentRepository: PaymentRepository;
};

export class PublicCheckoutService {
  private readonly bookingRepository: BookingRepository;
  private readonly paymentRepository: PaymentRepository;

  constructor({
    bookingRepository,
    paymentRepository,
  }: PublicCheckoutServiceDependencies) {
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
  }

  async getCheckoutData(
    gorSlug: string,
    bookingId: string,
  ): Promise<PublicCheckoutData> {
    const booking =
      await this.bookingRepository.findPublicCheckoutById(bookingId);

    if (!booking || booking.court.gor.slug !== gorSlug) {
      throw new PublicCheckoutNotFoundError();
    }

    if (!booking.contact) {
      throw new PublicCheckoutNotFoundError(
        "Booking contact is required for checkout.",
      );
    }

    const paidPayment = await this.paymentRepository.findPaidDetailsByBookingId(
      booking.id,
    );
    const activeManualPayment =
      paidPayment == null
        ? await this.paymentRepository.findActiveManualPaymentByBookingId(
            booking.id,
          )
        : null;
    const latestPayment =
      paidPayment ??
      activeManualPayment ??
      (await this.paymentRepository.findLatestByBookingId(booking.id));

    const isExpired =
      booking.status === "PENDING" &&
      !isBookingSlotHoldActive(booking.status, booking.expiresAt, new Date()) &&
      latestPayment?.status !== PAYMENT_STATUS.AWAITING_CONFIRMATION;

    const effectiveStatus = isExpired ? "CANCELLED" : booking.status;
    const customerPaymentStatus = resolveCustomerPaymentDisplayStatus({
      bookingStatus: effectiveStatus,
      paymentStatus: latestPayment?.status ?? null,
      bookingDate: booking.bookingDate,
    });

    const gor = booking.court.gor;

    return {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingDate: booking.bookingDate.toISOString(),
      startMinute: booking.startMinute,
      endMinute: booking.endMinute,
      durationMinute: booking.durationMinute,
      totalPrice: booking.totalPrice,
      pricePerHourSnapshot: booking.pricePerHourSnapshot,
      status: effectiveStatus,
      expiresAt: booking.expiresAt.toISOString(),
      customerName: booking.contact.customerName,
      customerPhone: booking.contact.customerPhone,
      venueName: gor.name,
      venueSlug: gor.slug,
      courtName: booking.courtNameSnapshot,
      hasPaidPayment: paidPayment != null,
      hasPendingPayment: activeManualPayment?.status === PAYMENT_STATUS.PENDING,
      invoiceId: paidPayment?.invoice?.id ?? null,
      invoiceNumber: paidPayment?.invoice?.invoiceNumber ?? null,
      latestPaymentStatus: latestPayment?.status ?? null,
      customerPaymentStatus,
      customerConfirmedAt:
        latestPayment?.customerConfirmedAt?.toISOString() ?? null,
      rejectionReason: latestPayment?.rejectionReason ?? null,
      ownerPaymentInstructions: {
        venueName: gor.name,
        bankName: gor.bankName,
        bankAccountNumber: gor.bankAccountNumber,
        bankAccountHolder: gor.bankAccountHolder,
        qrisImageUrl: gor.qrisImageUrl,
      },
      paymentSummary: paidPayment
        ? {
            status: paidPayment.status,
            amount: paidPayment.amount,
            paidAt: paidPayment.paidAt?.toISOString() ?? null,
            method: paidPayment.method,
          }
        : null,
    };
  }
}

export function createPublicCheckoutService(
  dependencies: PublicCheckoutServiceDependencies,
): PublicCheckoutService {
  return new PublicCheckoutService(dependencies);
}
