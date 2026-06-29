import { SUBSCRIPTION_OWNER_FEATURE_STATUSES } from "@/domains/subscription/constants";
import type { SubscriptionAccessSnapshot } from "@/domains/subscription/types";
import type { SubscriptionStatus } from "@/generated/prisma/client";

export function canUseOwnerFeatures(status: SubscriptionStatus): boolean {
  return SUBSCRIPTION_OWNER_FEATURE_STATUSES.includes(
    status as (typeof SUBSCRIPTION_OWNER_FEATURE_STATUSES)[number],
  );
}

export function buildSubscriptionAccessSnapshot(input: {
  status: SubscriptionStatus;
  statusLabel: string;
  graceUntil: string | null;
}): SubscriptionAccessSnapshot {
  return {
    status: input.status,
    statusLabel: input.statusLabel,
    canUseOwnerFeatures: canUseOwnerFeatures(input.status),
    showGraceWarning: input.status === "GRACE_PERIOD",
    isExpired: input.status === "EXPIRED",
    graceUntil: input.graceUntil,
  };
}
