"use client";

import { useTransition } from "react";

import { createSubscriptionPaymentAction } from "@/domains/subscription/actions/create-subscription-payment.action";
import { SUBSCRIPTION_BILLING_ACTION } from "@/domains/subscription/constants";
import type { CurrentSubscriptionData } from "@/domains/subscription/types";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/domains/booking/utils/booking-display";
import { SUBSCRIPTION_PLAN_PRICES } from "@/domains/subscription/constants";

type SubscriptionBillingActionsProps = {
  subscription: CurrentSubscriptionData;
};

export function SubscriptionBillingActions({
  subscription,
}: SubscriptionBillingActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handlePayment = (billingAction: "UPGRADE" | "RENEW") => {
    startTransition(async () => {
      const result = await createSubscriptionPaymentAction({ billingAction });

      if (!result.success) {
        window.alert(result.error);
        return;
      }

      window.location.href = result.data.paymentUrl;
    });
  };

  const upgradePrice = subscription.nextUpgradePlan
    ? SUBSCRIPTION_PLAN_PRICES[subscription.nextUpgradePlan]
    : null;
  const renewPrice = SUBSCRIPTION_PLAN_PRICES[subscription.plan];

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {subscription.nextUpgradePlan ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => handlePayment(SUBSCRIPTION_BILLING_ACTION.UPGRADE)}
        >
          {isPending
            ? "Memproses..."
            : `Upgrade ke ${subscription.nextUpgradePlanLabel} (${formatCurrency(upgradePrice ?? 0)})`}
        </Button>
      ) : null}
      {subscription.canRenew ? (
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => handlePayment(SUBSCRIPTION_BILLING_ACTION.RENEW)}
        >
          {isPending
            ? "Memproses..."
            : `Perpanjang ${subscription.planLabel} (${formatCurrency(renewPrice)})`}
        </Button>
      ) : null}
    </div>
  );
}
