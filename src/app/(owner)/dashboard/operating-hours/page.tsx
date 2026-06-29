import { ProtectedOwnerFeaturePlaceholder } from "@/components/subscription/protected-owner-feature-placeholder";
import { SubscriptionFeatureGate } from "@/components/subscription/subscription-feature-gate";
import { getOwnerSubscriptionAccess } from "@/domains/subscription/guards/subscription-guard";

export const metadata = {
  title: "Operating Hours",
};

export default async function DashboardOperatingHoursPage() {
  const { access } = await getOwnerSubscriptionAccess();

  return (
    <SubscriptionFeatureGate access={access}>
      <ProtectedOwnerFeaturePlaceholder
        title="Operating Hours"
        description="Atur jam operasional lapangan venue kamu."
      />
    </SubscriptionFeatureGate>
  );
}
