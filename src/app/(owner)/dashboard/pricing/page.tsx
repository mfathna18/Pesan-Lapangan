import { ProtectedOwnerFeaturePlaceholder } from "@/components/subscription/protected-owner-feature-placeholder";
import { SubscriptionFeatureGate } from "@/components/subscription/subscription-feature-gate";
import { getOwnerSubscriptionAccess } from "@/domains/subscription/guards/subscription-guard";

export const metadata = {
  title: "Pricing",
};

export default async function DashboardPricingPage() {
  const { access } = await getOwnerSubscriptionAccess();

  return (
    <SubscriptionFeatureGate access={access}>
      <ProtectedOwnerFeaturePlaceholder
        title="Pricing"
        description="Atur price rules untuk setiap lapangan."
      />
    </SubscriptionFeatureGate>
  );
}
