import { OwnerDashboardKpiCards } from "@/components/dashboard/owner-dashboard-kpi-cards";
import { OwnerOnboardingEmptyState } from "@/components/dashboard/owner-onboarding-empty-state";
import { OwnerRecentBookingsTable } from "@/components/dashboard/owner-recent-bookings-table";
import type { OwnerOperationalDashboardData } from "@/domains/analytics/types";

type OwnerOperationalDashboardProps = {
  data: OwnerOperationalDashboardData;
};

export function OwnerOperationalDashboard({
  data,
}: OwnerOperationalDashboardProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Ringkasan
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Beranda</h1>
        <p className="text-muted-foreground text-sm">
          Pantau operasional venue, booking, dan pendapatan hari ini.
        </p>
      </div>

      {!data.hasBookings ? (
        <OwnerOnboardingEmptyState />
      ) : (
        <>
          <OwnerDashboardKpiCards kpis={data.kpis} />
          <OwnerRecentBookingsTable bookings={data.recentBookings} />
        </>
      )}
    </div>
  );
}
