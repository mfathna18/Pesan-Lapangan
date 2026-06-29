import { BookingForm } from "@/components/booking/booking-form";
import { SubscriptionExpiredBlock } from "@/components/subscription/subscription-expired-block";
import { getCourtRepository } from "@/domains/booking/actions/get-court-repository";
import { getOwnerSubscriptionAccess } from "@/domains/subscription/guards/subscription-guard";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const dynamic = "force-dynamic";

export default async function OwnerNewBookingPage() {
  await requireOwnerSession();
  const { access } = await getOwnerSubscriptionAccess();

  if (!access.canUseOwnerFeatures) {
    return <SubscriptionExpiredBlock />;
  }

  const courts = await getCourtRepository().findActiveCourts();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            Owner
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">New Booking</h1>
        </div>

        <BookingForm courts={courts} />
      </div>
    </main>
  );
}
