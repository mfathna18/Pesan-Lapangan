import { BookingForm } from "@/components/booking/booking-form";
import { getCourtRepository } from "@/domains/booking/actions/get-court-repository";

export const dynamic = "force-dynamic";

export default async function OwnerNewBookingPage() {
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
