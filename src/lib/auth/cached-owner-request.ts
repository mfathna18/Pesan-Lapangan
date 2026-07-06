import { cache } from "react";

import { getPushService } from "@/domains/push/actions/get-push-service";
import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import { getOwnerSubscriptionAccessForUser } from "@/domains/subscription/guards/subscription-guard";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

/** Request-scoped deduplication for owner dashboard server components and actions. */
export const getCachedOwnerSession = cache(requireOwnerSession);

export const getCachedOwnerId = cache(requireOwnerId);

export const getCachedCurrentSubscription = cache(async (userId: string) => {
  return getSubscriptionService().getCurrentSubscription(userId);
});

export const getCachedSubscriptionAccess = cache(async (userId: string) => {
  return getOwnerSubscriptionAccessForUser(userId);
});

export const getCachedPushSettings = cache(async (ownerId: string) => {
  return getPushService().getSettingsForOwner(ownerId);
});
