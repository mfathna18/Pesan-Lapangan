import { getManualPaymentService } from "@/domains/payment/actions/get-manual-payment-service";
import { getPublicCheckoutService } from "@/domains/payment/actions/get-public-checkout-service";

export async function loadPublicCheckoutData(
  gorSlug: string,
  bookingId: string,
) {
  const checkoutService = getPublicCheckoutService();
  const manualPaymentService = getManualPaymentService();
  const checkout = await checkoutService.getCheckoutData(gorSlug, bookingId);

  if (
    checkout.status === "PENDING" &&
    !checkout.hasPaidPayment &&
    checkout.latestPaymentStatus !== "AWAITING_CONFIRMATION" &&
    checkout.latestPaymentStatus !== "REJECTED"
  ) {
    await manualPaymentService.ensureManualPayment(bookingId);
  }

  return checkoutService.getCheckoutData(gorSlug, bookingId);
}
