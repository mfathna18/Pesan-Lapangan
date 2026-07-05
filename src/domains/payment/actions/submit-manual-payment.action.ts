"use server";

import { revalidatePath } from "next/cache";

import { getManualPaymentService } from "@/domains/payment/actions/get-manual-payment-service";
import {
  createPublicPaymentSchema,
  formatPaymentZodError,
} from "@/domains/payment/actions/schemas";
import { actionFailure, actionSuccess } from "@/domains/payment/actions/types";
import {
  ManualPaymentNotFoundError,
  PaymentValidationError,
} from "@/domains/payment/errors";
import { getNotificationEmitter } from "@/domains/notification/actions/get-notification-service";
import {
  dispatchOwnerBookingCancelled,
  dispatchOwnerPaymentAwaiting,
} from "@/domains/whatsapp/utils/whatsapp-dispatch";

export async function submitManualPaymentConfirmationAction(input: unknown) {
  const parsed = createPublicPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatPaymentZodError(parsed.error));
  }

  try {
    await getManualPaymentService().submitCustomerConfirmation(parsed.data);

    await getNotificationEmitter().emitPaymentAwaitingConfirmation(
      parsed.data.bookingId,
    );
    await dispatchOwnerPaymentAwaiting(parsed.data.bookingId);

    revalidatePath(
      `/gor/${parsed.data.gorSlug}/checkout/${parsed.data.bookingId}`,
    );

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

export async function cancelManualBookingAction(input: unknown) {
  const parsed = createPublicPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatPaymentZodError(parsed.error));
  }

  try {
    await getManualPaymentService().cancelBookingByCustomer(parsed.data);

    await getNotificationEmitter().emitBookingCancelled(parsed.data.bookingId);
    await dispatchOwnerBookingCancelled(parsed.data.bookingId);

    revalidatePath(
      `/gor/${parsed.data.gorSlug}/checkout/${parsed.data.bookingId}`,
    );

    return actionSuccess({ cancelled: true });
  } catch (error) {
    if (error instanceof PaymentValidationError) {
      return actionFailure(error.message);
    }

    return actionFailure("Gagal membatalkan booking.");
  }
}
