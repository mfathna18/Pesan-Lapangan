import { AnalyticsFavoriteHoursChart } from "@/components/analytics/analytics-favorite-hours-chart";
import { AnalyticsSportDistributionChart } from "@/components/analytics/analytics-sport-distribution-chart";
import { AnalyticsSummaryCards } from "@/components/analytics/analytics-summary-cards";
import { AnalyticsTopCourtsTable } from "@/components/analytics/analytics-top-courts-table";
import { OwnerOnboardingEmptyState } from "@/components/dashboard/owner-onboarding-empty-state";
import { OwnerRecentBookingsTable } from "@/components/dashboard/owner-recent-bookings-table";
import { PageHeader } from "@/components/ui/page-header";
import type { OwnerAnalyticsDashboardData } from "@/domains/analytics/analytics-types";
import { formatBookingDate } from "@/domains/booking/utils/booking-display";
import { layout } from "@/lib/design-system";

type AnalyticsDashboardProps = {
  data: OwnerAnalyticsDashboardData;
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Analitik"
        title="Analitik Operasional"
        description={`Ringkasan booking dan performa venue untuk periode ${formatBookingDate(data.period.from)} – ${formatBookingDate(data.period.to)}.`}
      />

      {!data.hasBookings ? (
        <OwnerOnboardingEmptyState
          title="Belum ada data analitik"
          description="Halaman analitik akan menampilkan lapangan terlaris, jam favorit, dan distribusi olahraga setelah pelanggan pertama kali melakukan booking di venue Anda."
        />
      ) : (
        <>
          <AnalyticsSummaryCards kpis={data.kpis} />

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsTopCourtsTable courts={data.topCourts} />
            <AnalyticsFavoriteHoursChart data={data.topHours} />
          </div>

          <AnalyticsSportDistributionChart data={data.sportDistribution} />

          <OwnerRecentBookingsTable bookings={data.recentBookings} />
        </>
      )}
    </div>
  );
}
