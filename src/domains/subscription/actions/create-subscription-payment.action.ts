"use server";

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
import { PaymentGatewayError } from "@/domains/payment/errors";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export async function createSubscriptionPaymentAction(
  input: unknown,
): Promise<ActionResponse<CreateSubscriptionPaymentResult>> {
  const parsed = createSubscriptionPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatSubscriptionZodError(parsed.error));
  }

  try {
    const session = await requireOwnerSession();
    const payment = await getSubscriptionService().createSubscriptionPayment({
      userId: session.user.id,
      billingAction: parsed.data.billingAction,
    });

    return actionSuccess(payment);
  } catch (error) {
    if (error instanceof OwnerSubscriptionNotFoundError) {
      return actionFailure("Akun owner tidak ditemukan.");
    }

    if (error instanceof SubscriptionBillingValidationError) {
      return actionFailure(error.message);
    }

    if (error instanceof PaymentGatewayError) {
      return actionFailure(
        "Gagal membuat pembayaran. Silakan coba lagi dalam beberapa saat.",
      );
    }

    return actionFailure("Gagal memproses pembayaran langganan.");
  }
}
