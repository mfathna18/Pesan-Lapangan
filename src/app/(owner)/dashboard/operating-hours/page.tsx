import { OperatingHoursManagement } from "@/components/operating-hours/operating-hours-management";
import { SubscriptionFeatureGate } from "@/components/subscription/subscription-feature-gate";
import { createPageMetadata } from "@/config/page-metadata";
import { getOwnerSubscriptionAccess } from "@/domains/subscription/guards/subscription-guard";

export const metadata = createPageMetadata(
  "Jam Operasional",
  "Atur jadwal buka tutup lapangan setiap hari.",
);

export default async function DashboardOperatingHoursPage() {
  const { access } = await getOwnerSubscriptionAccess();

  return (
    <SubscriptionFeatureGate access={access}>
      <OperatingHoursManagement />
    </SubscriptionFeatureGate>
  );
}
