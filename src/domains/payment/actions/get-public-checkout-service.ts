import { createBookingRepository } from "@/domains/booking/repositories/booking-repository";
import { createPaymentRepository } from "@/domains/payment/repositories/payment-repository";
import { createPublicCheckoutService } from "@/domains/payment/services/public-checkout-service";
import { prisma } from "@/lib/db/prisma";

export function getPublicCheckoutService() {
  return createPublicCheckoutService({
    bookingRepository: createBookingRepository(prisma),
    paymentRepository: createPaymentRepository(prisma),
  });
}
