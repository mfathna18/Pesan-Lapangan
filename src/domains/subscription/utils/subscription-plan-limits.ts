import { SUBSCRIPTION_PLAN_ORDER } from "@/domains/subscription/constants";
import type { SubscriptionPlan } from "@/generated/prisma/client";

export const SUBSCRIPTION_COURT_LIMIT_REACHED_MESSAGE =
  "Batas lapangan paket Anda tercapai. Upgrade paket untuk menambahkan lapangan." as const;

export const SUBSCRIPTION_DOWNGRADE_COURT_VALIDATION_MESSAGE =
  "Nonaktifkan lapangan terlebih dahulu sebelum menurunkan paket." as const;

/** `null` means unlimited courts. */
export const SUBSCRIPTION_PLAN_COURT_LIMITS: Record<
  SubscriptionPlan,
  number | null
> = {
  FREE: 2,
  STARTER: 2,
  PRO: 5,
  ELITE: null,
};

export function getPlanOrder(plan: SubscriptionPlan): number {
  return SUBSCRIPTION_PLAN_ORDER.indexOf(plan);
}

export function getCourtLimitForPlan(plan: SubscriptionPlan): number | null {
  return SUBSCRIPTION_PLAN_COURT_LIMITS[plan];
}

export function formatCourtCapacityLabel(input: {
  current: number;
  limit: number | null;
}): string {
  if (input.limit === null) {
    return "Unlimited";
  }

  return `${input.current} / ${input.limit} Lapangan`;
}

export function canCreateCourt(input: {
  plan: SubscriptionPlan;
  currentCourtCount: number;
}): boolean {
  const limit = getCourtLimitForPlan(input.plan);

  if (limit === null) {
    return true;
  }

  return input.currentCourtCount < limit;
}

export function canChangeToPlan(input: {
  currentPlan: SubscriptionPlan;
  targetPlan: SubscriptionPlan;
  currentCourtCount: number;
}): boolean {
  if (getPlanOrder(input.targetPlan) >= getPlanOrder(input.currentPlan)) {
    return true;
  }

  const targetLimit = getCourtLimitForPlan(input.targetPlan);

  if (targetLimit === null) {
    return true;
  }

  return input.currentCourtCount <= targetLimit;
}

export function isPaidSubscriptionPlan(
  plan: SubscriptionPlan,
): plan is Exclude<SubscriptionPlan, "FREE"> {
  return plan !== "FREE";
}
