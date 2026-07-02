import { OwnerDashboardKpiCards } from "@/components/dashboard/owner-dashboard-kpi-cards";
import { OwnerOnboardingEmptyState } from "@/components/dashboard/owner-onboarding-empty-state";
import { OwnerRecentBookingsTable } from "@/components/dashboard/owner-recent-bookings-table";
import { PageHeader } from "@/components/ui/page-header";
import type { OwnerOperationalDashboardData } from "@/domains/analytics/types";
import { layout } from "@/lib/design-system";

type OwnerOperationalDashboardProps = {
  data: OwnerOperationalDashboardData;
};

export function OwnerOperationalDashboard({
  data,
}: OwnerOperationalDashboardProps) {
  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Ringkasan"
        title="Beranda"
        description="Pantau operasional venue, booking, dan pendapatan hari ini."
      />

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
