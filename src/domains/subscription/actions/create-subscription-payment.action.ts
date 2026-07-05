"use server";

import { PaymentGatewayError } from "@/domains/payment/errors";
import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import {
  createSubscriptionPaymentSchema,
  formatSubscriptionZodError,
} from "@/domains/subscription/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/subscription/actions/types";
import {
  OwnerSubscriptionNotFoundError,
  SubscriptionBillingValidationError,
} from "@/domains/subscription/errors";
import type { CreateSubscriptionPaymentResult } from "@/domains/subscription/types";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function createSubscriptionPaymentAction(
  input: unknown,
): Promise<ActionResponse<CreateSubscriptionPaymentResult>> {
  const parsed = createSubscriptionPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatSubscriptionZodError(parsed.error));
  }

  const session = await requireOwnerSession();

  try {
    const payment = await getSubscriptionService().createSubscriptionPayment({
      userId: session.user.id,
      billingAction: parsed.data.billingAction,
    });

    return actionSuccess(payment);
  } catch (error) {
    return handleServerActionError("createSubscriptionPaymentAction", error, {
      fallbackMessage: "Gagal memproses pembayaran langganan.",
      knownErrors: [
        createKnownActionError(
          OwnerSubscriptionNotFoundError,
          "Akun owner tidak ditemukan.",
        ),
        createKnownActionError(SubscriptionBillingValidationError),
        createKnownActionError(
          PaymentGatewayError,
          "Gagal membuat pembayaran. Silakan coba lagi dalam beberapa saat.",
        ),
      ],
    });
  }
}
