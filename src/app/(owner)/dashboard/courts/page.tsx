import { CourtManagement } from "@/components/court/court-management";
import { SubscriptionFeatureGate } from "@/components/subscription/subscription-feature-gate";
import { createPageMetadata } from "@/config/page-metadata";
import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import { getOwnerSubscriptionAccess } from "@/domains/subscription/guards/subscription-guard";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = createPageMetadata(
  "Lapangan",
  "Kelola lapangan olahraga di venue Anda.",
);

export default async function DashboardCourtsPage() {
  const session = await requireOwnerSession();
  const [{ access }, subscription] = await Promise.all([
    getOwnerSubscriptionAccess(),
    getSubscriptionService().getCurrentSubscription(session.user.id),
  ]);

  return (
    <SubscriptionFeatureGate access={access}>
      <CourtManagement courtCapacity={subscription.courtCapacity} />
    </SubscriptionFeatureGate>
  );
}
