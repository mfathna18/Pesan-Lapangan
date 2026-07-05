import {
  SUBSCRIPTION_BILLING_PERIOD_DAYS,
  SUBSCRIPTION_GRACE_PERIOD_DAYS,
  SUBSCRIPTION_PAID_PLANS,
  SUBSCRIPTION_PLAN_ORDER,
  SUBSCRIPTION_PLAN_PRICES,
} from "@/domains/subscription/constants";
import { getPlanOrder } from "@/domains/subscription/utils/subscription-plan-limits";
import type { SubscriptionPlan } from "@/generated/prisma/client";

export function getNextUpgradePlan(
  plan: SubscriptionPlan,
): SubscriptionPlan | null {
  const index = SUBSCRIPTION_PLAN_ORDER.indexOf(plan);

  if (index < 0 || index >= SUBSCRIPTION_PLAN_ORDER.length - 1) {
    return null;
  }

  return SUBSCRIPTION_PLAN_ORDER[index + 1] ?? null;
}

export function canRenewPlan(plan: SubscriptionPlan): boolean {
  return SUBSCRIPTION_PAID_PLANS.includes(
    plan as (typeof SUBSCRIPTION_PAID_PLANS)[number],
  );
}

export function isPlanUpgrade(
  currentPlan: SubscriptionPlan,
  targetPlan: SubscriptionPlan,
): boolean {
  return getPlanOrder(targetPlan) > getPlanOrder(currentPlan);
}

export function isPlanDowngrade(
  currentPlan: SubscriptionPlan,
  targetPlan: SubscriptionPlan,
): boolean {
  return getPlanOrder(targetPlan) < getPlanOrder(currentPlan);
}

export function getPlanPrice(plan: SubscriptionPlan): number {
  return SUBSCRIPTION_PLAN_PRICES[plan];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result;
}

export function resolveRenewedExpiresAt(
  currentExpiresAt: Date | null,
  referenceDate: Date = new Date(),
): Date {
  const baseDate =
    currentExpiresAt && currentExpiresAt.getTime() > referenceDate.getTime()
      ? currentExpiresAt
      : referenceDate;

  return addDays(baseDate, SUBSCRIPTION_BILLING_PERIOD_DAYS);
}

export function resolveUpgradeExpiresAt(
  referenceDate: Date = new Date(),
): Date {
  return addDays(referenceDate, SUBSCRIPTION_BILLING_PERIOD_DAYS);
}

export function resolveGraceUntil(expiresAt: Date): Date {
  return addDays(expiresAt, SUBSCRIPTION_GRACE_PERIOD_DAYS);
}
