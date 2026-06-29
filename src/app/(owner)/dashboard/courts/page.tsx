import { ProtectedOwnerFeaturePlaceholder } from "@/components/subscription/protected-owner-feature-placeholder";
import { SubscriptionFeatureGate } from "@/components/subscription/subscription-feature-gate";
import { getOwnerSubscriptionAccess } from "@/domains/subscription/guards/subscription-guard";

export const metadata = {
  title: "Courts",
};

export default async function DashboardCourtsPage() {
  const { access } = await getOwnerSubscriptionAccess();

  return (
    <SubscriptionFeatureGate access={access}>
      <ProtectedOwnerFeaturePlaceholder
        title="Courts"
        description="Kelola lapangan venue kamu dari halaman ini."
      />
    </SubscriptionFeatureGate>
  );
}
