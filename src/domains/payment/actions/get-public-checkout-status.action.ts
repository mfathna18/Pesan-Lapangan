"use server";

import {
  formatPaymentZodError,
  getPublicCheckoutStatusSchema,
} from "@/domains/payment/actions/schemas";
import { getPublicCheckoutService } from "@/domains/payment/actions/get-public-checkout-service";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/payment/actions/types";
import { PublicCheckoutNotFoundError } from "@/domains/payment/errors";
import type { PublicCheckoutData } from "@/domains/payment/types";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function getPublicCheckoutStatusAction(
  input: unknown,
): Promise<ActionResponse<PublicCheckoutData>> {
  const parsed = getPublicCheckoutStatusSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatPaymentZodError(parsed.error));
  }

  try {
    const checkout = await getPublicCheckoutService().getCheckoutData(
      parsed.data.gorSlug,
      parsed.data.bookingId,
    );

    return actionSuccess(checkout);
  } catch (error) {
    return handleServerActionError("getPublicCheckoutStatusAction", error, {
      fallbackMessage: "Gagal memuat status checkout.",
      knownErrors: [
        createKnownActionError(
          PublicCheckoutNotFoundError,
          "Checkout tidak ditemukan.",
        ),
      ],
    });
  }
}
