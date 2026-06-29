import { z } from "zod";

import { SUBSCRIPTION_BILLING_ACTION } from "@/domains/subscription/constants";

export const createSubscriptionPaymentSchema = z.object({
  billingAction: z.enum([
    SUBSCRIPTION_BILLING_ACTION.UPGRADE,
    SUBSCRIPTION_BILLING_ACTION.RENEW,
  ]),
});

export function formatSubscriptionZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}
