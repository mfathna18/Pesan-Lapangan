import { CourtManagement } from "@/components/court/court-management";
import { SubscriptionFeatureGate } from "@/components/subscription/subscription-feature-gate";
import { createPageMetadata } from "@/config/page-metadata";
import { getOwnerSubscriptionAccess } from "@/domains/subscription/guards/subscription-guard";

export const metadata = createPageMetadata(
  "Lapangan",
  "Kelola lapangan olahraga di venue Anda.",
);

export default async function DashboardCourtsPage() {
  const { access } = await getOwnerSubscriptionAccess();

  return (
    <SubscriptionFeatureGate access={access}>
      <CourtManagement />
    </SubscriptionFeatureGate>
  );
}
