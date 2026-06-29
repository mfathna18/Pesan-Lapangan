import type { SubscriptionAccessSnapshot } from "@/domains/subscription/types";

import { SubscriptionExpiredBlock } from "./subscription-expired-block";

type SubscriptionFeatureGateProps = {
  access: SubscriptionAccessSnapshot;
  children: React.ReactNode;
};

export function SubscriptionFeatureGate({
  access,
  children,
}: SubscriptionFeatureGateProps) {
  if (!access.canUseOwnerFeatures) {
    return <SubscriptionExpiredBlock />;
  }

  return children;
}
