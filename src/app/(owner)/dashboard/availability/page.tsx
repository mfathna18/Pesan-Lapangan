import { OwnerAvailabilityVerification } from "@/components/availability/owner-availability-verification";
import { SubscriptionFeatureGate } from "@/components/subscription/subscription-feature-gate";
import { createPageMetadata } from "@/config/page-metadata";
import { getGorProfileService } from "@/domains/owner/actions/get-gor-profile-service";
import { getOwnerSubscriptionAccess } from "@/domains/subscription/guards/subscription-guard";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = createPageMetadata(
  "Ketersediaan",
  "Verifikasi slot booking setelah mengatur jam operasional dan harga.",
);

export default async function DashboardAvailabilityPage() {
  const session = await requireOwnerSession();
  const { access } = await getOwnerSubscriptionAccess();

  let gorSlug: string | null = null;

  try {
    const profile = await getGorProfileService().getForUser(session.user.id);
    gorSlug = profile?.slug ?? null;
  } catch {
    gorSlug = null;
  }

  return (
    <SubscriptionFeatureGate access={access}>
      <OwnerAvailabilityVerification gorSlug={gorSlug} />
    </SubscriptionFeatureGate>
  );
}
