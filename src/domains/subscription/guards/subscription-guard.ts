import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import type { SubscriptionAccessSnapshot } from "@/domains/subscription/types";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export async function getOwnerSubscriptionAccess(): Promise<{
  userId: string;
  access: SubscriptionAccessSnapshot;
}> {
  const session = await requireOwnerSession();
  const access = await getSubscriptionService().getSubscriptionAccess(
    session.user.id,
  );

  return {
    userId: session.user.id,
    access,
  };
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
