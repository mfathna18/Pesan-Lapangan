"use server";

import { revalidatePath } from "next/cache";

import { getManualPaymentService } from "@/domains/payment/actions/get-manual-payment-service";
import { actionFailure, actionSuccess } from "@/domains/payment/actions/types";
import {
  ManualPaymentNotFoundError,
  PaymentValidationError,
} from "@/domains/payment/errors";

type SubmitManualPaymentInput = {
  gorSlug: string;
  bookingId: string;
};

export async function submitManualPaymentConfirmationAction(
  input: SubmitManualPaymentInput,
) {
  try {
    await getManualPaymentService().submitCustomerConfirmation(input);

    revalidatePath(`/gor/${input.gorSlug}/checkout/${input.bookingId}`);

    return actionSuccess({ submitted: true });
  } catch (error) {
    if (error instanceof PaymentValidationError) {
      return actionFailure(error.message);
    }

    if (error instanceof ManualPaymentNotFoundError) {
      return actionFailure("Booking tidak ditemukan.");
    }

    return actionFailure("Gagal mengirim konfirmasi pembayaran.");
  }
}

export async function cancelManualBookingAction(
  input: SubmitManualPaymentInput,
) {
  try {
    await getManualPaymentService().cancelBookingByCustomer(input);

    revalidatePath(`/gor/${input.gorSlug}/checkout/${input.bookingId}`);

    return actionSuccess({ cancelled: true });
  } catch (error) {
    if (error instanceof PaymentValidationError) {
      return actionFailure(error.message);
    }

    return actionFailure("Gagal membatalkan booking.");
  }
}
