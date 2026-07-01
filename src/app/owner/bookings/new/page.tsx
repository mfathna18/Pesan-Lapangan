import { BookingForm } from "@/components/booking/booking-form";
import { SubscriptionExpiredBlock } from "@/components/subscription/subscription-expired-block";
import { createPageMetadata } from "@/config/page-metadata";
import { getCourtRepository } from "@/domains/booking/actions/get-court-repository";
import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "Booking Baru",
  "Buat booking lapangan baru untuk venue Anda.",
);

export default async function OwnerNewBookingPage() {
  const session = await requireOwnerSession();
  const access = await getSubscriptionService().getSubscriptionAccess(
    session.user.id,
  );

  if (!access.canUseOwnerFeatures) {
    return <SubscriptionExpiredBlock />;
  }

  const ownerId = await requireOwnerId(session.user.id);
  const courts = await getCourtRepository().findActiveCourtsByOwnerId(ownerId);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            Pemilik
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Booking Baru
          </h1>
        </div>

        <BookingForm courts={courts} />
      </div>
    </main>
  );
}
