"use server";

import { siteConfig } from "@/config/site";
import { getPaymentService } from "@/domains/payment/actions/get-payment-service";
import { getPublicCheckoutService } from "@/domains/payment/actions/get-public-checkout-service";
import {
  createPublicPaymentSchema,
  formatPaymentZodError,
} from "@/domains/payment/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/payment/actions/types";
import {
  BookingNotFoundForPaymentError,
  PaymentGatewayError,
  PaymentValidationError,
  PublicCheckoutNotFoundError,
} from "@/domains/payment/errors";
import type { CreatePaymentResult } from "@/domains/payment/types";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function createPublicPaymentAction(
  input: unknown,
): Promise<ActionResponse<CreatePaymentResult>> {
  const parsed = createPublicPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatPaymentZodError(parsed.error));
  }

  try {
    const checkout = await getPublicCheckoutService().getCheckoutData(
      parsed.data.gorSlug,
      parsed.data.bookingId,
    );

    if (checkout.hasPaidPayment) {
      return actionFailure("Booking ini sudah dibayar.");
    }

    if (checkout.status !== "PENDING") {
      return actionFailure("Booking tidak dapat dibayar saat ini.");
    }

    if (new Date(checkout.expiresAt).getTime() <= Date.now()) {
      return actionFailure("Waktu pembayaran booking telah habis.");
    }

    const waitingUrl = `${siteConfig.url}/gor/${parsed.data.gorSlug}/checkout/${parsed.data.bookingId}/waiting`;
    const payment = await getPaymentService().createPayment({
      bookingId: parsed.data.bookingId,
      finishRedirectUrl: waitingUrl,
    });

    return actionSuccess(payment);
  } catch (error) {
    return handleServerActionError("createPublicPaymentAction", error, {
      fallbackMessage: "Gagal memproses pembayaran.",
      knownErrors: [
        createKnownActionError(
          PublicCheckoutNotFoundError,
          "Booking checkout tidak ditemukan.",
        ),
        createKnownActionError(
          BookingNotFoundForPaymentError,
          "Booking tidak ditemukan.",
        ),
        createKnownActionError(PaymentValidationError),
        createKnownActionError(
          PaymentGatewayError,
          "Gagal membuat pembayaran. Silakan coba lagi dalam beberapa saat.",
        ),
      ],
    });
  }
}
