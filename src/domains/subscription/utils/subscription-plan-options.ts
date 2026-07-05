import {
  SUBSCRIPTION_BEST_VALUE_PLAN,
  SUBSCRIPTION_PAID_PLANS,
  SUBSCRIPTION_PLAN_COURT_LIMIT_LABELS,
  SUBSCRIPTION_PLAN_LABELS,
  SUBSCRIPTION_PLAN_PRICES,
} from "@/domains/subscription/constants";
import {
  canChangeToPlan,
  isPaidSubscriptionPlan,
} from "@/domains/subscription/utils/subscription-plan-limits";
import {
  canRenewPlan,
  isPlanDowngrade,
  isPlanUpgrade,
} from "@/domains/subscription/utils/subscription-billing";
import type { SubscriptionPlanOption } from "@/domains/subscription/types";
import type { SubscriptionPlan } from "@/generated/prisma/client";

export function buildSubscriptionPlanOptions(input: {
  currentPlan: SubscriptionPlan;
  currentCourtCount: number;
}): SubscriptionPlanOption[] {
  return SUBSCRIPTION_PAID_PLANS.map((plan) => {
    const isCurrent = input.currentPlan === plan;
    const canSelect =
      !isCurrent &&
      canChangeToPlan({
        currentPlan: input.currentPlan,
        targetPlan: plan,
        currentCourtCount: input.currentCourtCount,
      });

    let action: SubscriptionPlanOption["action"] = "current";

    if (!isCurrent) {
      if (isPlanUpgrade(input.currentPlan, plan)) {
        action = "upgrade";
      } else if (isPlanDowngrade(input.currentPlan, plan)) {
        action = "downgrade";
      } else if (
        canRenewPlan(input.currentPlan) &&
        plan === input.currentPlan
      ) {
        action = "renew";
      }
    }

    return {
      plan,
      label: SUBSCRIPTION_PLAN_LABELS[plan],
      price: SUBSCRIPTION_PLAN_PRICES[plan],
      courtLimitLabel: SUBSCRIPTION_PLAN_COURT_LIMIT_LABELS[plan],
      isBestValue: plan === SUBSCRIPTION_BEST_VALUE_PLAN,
      isCurrent,
      canSelect,
      action,
    };
  });
}

export function resolveBillingActionForPlan(input: {
  currentPlan: SubscriptionPlan;
  targetPlan: SubscriptionPlan;
}): "UPGRADE" | "RENEW" | null {
  if (input.currentPlan === input.targetPlan) {
    return canRenewPlan(input.currentPlan) ? "RENEW" : null;
  }

  if (isPlanUpgrade(input.currentPlan, input.targetPlan)) {
    return "UPGRADE";
  }

  if (isPlanDowngrade(input.currentPlan, input.targetPlan)) {
    return "UPGRADE";
  }

  if (!isPaidSubscriptionPlan(input.currentPlan)) {
    return "UPGRADE";
  }

  return null;
}
