import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import type { SubscriptionAccessSnapshot } from "@/domains/subscription/types";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export async function getOwnerSubscriptionAccessForUser(
  userId: string,
): Promise<{
  userId: string;
  access: SubscriptionAccessSnapshot;
}> {
  const access = await getSubscriptionService().getSubscriptionAccess(userId);

  return {
    userId,
    access,
  };
}

export async function getOwnerSubscriptionAccess(): Promise<{
  userId: string;
  access: SubscriptionAccessSnapshot;
}> {
  const session = await requireOwnerSession();

  return getOwnerSubscriptionAccessForUser(session.user.id);
}

export async function requireOwnerFeatureAccess(): Promise<{
  userId: string;
  access: SubscriptionAccessSnapshot;
}> {
  const session = await requireOwnerSession();

  await getSubscriptionService().assertOwnerFeatureAccess(session.user.id);

  const access = await getSubscriptionService().getSubscriptionAccess(
    session.user.id,
  );

  return {
    userId: session.user.id,
    access,
  };
}
