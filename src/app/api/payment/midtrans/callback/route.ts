import { NextResponse } from "next/server";

import {
  createPaymentService,
  PaymentInvalidSignatureError,
  PaymentNotFoundError,
  PaymentValidationError,
} from "@/domains/payment";
import type { MidtransCallbackPayload } from "@/domains/payment/types";
import { getNotificationEmitter } from "@/domains/notification/actions/get-notification-service";
import { dispatchOwnerSubscriptionActivated } from "@/domains/whatsapp/utils/whatsapp-dispatch";
import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import { SUBSCRIPTION_PLAN_LABELS } from "@/domains/subscription/constants";
import {
  SubscriptionBillingValidationError,
  SubscriptionPaymentNotFoundError,
} from "@/domains/subscription/errors";
import { prisma } from "@/lib/db/prisma";
import { logError } from "@/lib/server/logger";

export const runtime = "nodejs";

function isMidtransCallbackPayload(
  value: unknown,
): value is MidtransCallbackPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.order_id === "string" &&
    typeof payload.status_code === "string" &&
    typeof payload.gross_amount === "string" &&
    typeof payload.signature_key === "string" &&
    typeof payload.transaction_status === "string"
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isMidtransCallbackPayload(body)) {
    return NextResponse.json(
      { error: "Invalid Midtrans callback payload" },
      { status: 400 },
    );
  }

  const paymentService = createPaymentService(prisma);
  const subscriptionService = getSubscriptionService();

  try {
    await paymentService.handleMidtransCallback(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PaymentNotFoundError) {
      try {
        const updatedPayment =
          await subscriptionService.handleMidtransCallback(body);

        if (updatedPayment?.status === "PAID") {
          const subscription = await prisma.subscription.findUnique({
            where: { id: updatedPayment.subscriptionId },
            select: { ownerId: true },
          });

          if (subscription) {
            const planLabel =
              SUBSCRIPTION_PLAN_LABELS[updatedPayment.targetPlan];

            await getNotificationEmitter().emitSubscriptionActivated(
              subscription.ownerId,
              planLabel,
            );
            await dispatchOwnerSubscriptionActivated(
              subscription.ownerId,
              planLabel,
            );
          }
        }

        return NextResponse.json({ ok: true });
      } catch (subscriptionError) {
        if (subscriptionError instanceof PaymentInvalidSignatureError) {
          return NextResponse.json(
            { error: subscriptionError.message },
            { status: 403 },
          );
        }

        if (subscriptionError instanceof SubscriptionPaymentNotFoundError) {
          return NextResponse.json(
            { error: subscriptionError.message },
            { status: 404 },
          );
        }

        if (subscriptionError instanceof SubscriptionBillingValidationError) {
          return NextResponse.json(
            { error: subscriptionError.message },
            { status: 422 },
          );
        }

        logError("Subscription Midtrans callback failed", subscriptionError);

        return NextResponse.json(
          { error: "Failed to process subscription Midtrans callback" },
          { status: 500 },
        );
      }
    }

    if (error instanceof PaymentInvalidSignatureError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof PaymentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof PaymentValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    logError("Midtrans callback failed", error);

    return NextResponse.json(
      { error: "Failed to process Midtrans callback" },
      { status: 500 },
    );
  }
}
