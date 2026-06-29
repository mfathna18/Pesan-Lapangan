import { PublicCheckoutNotFoundError } from "@/domains/payment/errors";
import type { BookingRepository } from "@/domains/booking/repositories/booking-repository";
import type { PaymentRepository } from "@/domains/payment/repositories/payment-repository";
import type { PublicCheckoutData } from "@/domains/payment/types";

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

    const paidPayment = await this.paymentRepository.findPaidByBookingId(
      booking.id,
    );

    return {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingDate: booking.bookingDate.toISOString(),
      startMinute: booking.startMinute,
      endMinute: booking.endMinute,
      durationMinute: booking.durationMinute,
      totalPrice: booking.totalPrice,
      pricePerHourSnapshot: booking.pricePerHourSnapshot,
      status: booking.status,
      customerName: booking.contact.customerName,
      customerPhone: booking.contact.customerPhone,
      venueName: booking.court.gor.name,
      venueSlug: booking.court.gor.slug,
      courtName: booking.courtNameSnapshot,
      hasPaidPayment: paidPayment != null,
    };
  }
}

export function createPublicCheckoutService(
  dependencies: PublicCheckoutServiceDependencies,
): PublicCheckoutService {
  return new PublicCheckoutService(dependencies);
}
