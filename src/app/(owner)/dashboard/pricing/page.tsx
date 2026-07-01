import { PricingManagement } from "@/components/pricing/pricing-management";
import { SubscriptionFeatureGate } from "@/components/subscription/subscription-feature-gate";
import { createPageMetadata } from "@/config/page-metadata";
import { getOwnerSubscriptionAccess } from "@/domains/subscription/guards/subscription-guard";

export const metadata = createPageMetadata(
  "Harga",
  "Atur harga lapangan berdasarkan hari dan jam.",
);

export default async function DashboardPricingPage() {
  const { access } = await getOwnerSubscriptionAccess();

  return (
    <SubscriptionFeatureGate access={access}>
      <PricingManagement />
    </SubscriptionFeatureGate>
  );
}
