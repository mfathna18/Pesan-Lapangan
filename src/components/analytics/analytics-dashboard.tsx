import { AnalyticsFavoriteHoursChart } from "@/components/analytics/analytics-favorite-hours-chart";
import { AnalyticsSportDistributionChart } from "@/components/analytics/analytics-sport-distribution-chart";
import { AnalyticsSummaryCards } from "@/components/analytics/analytics-summary-cards";
import { AnalyticsTopCourtsTable } from "@/components/analytics/analytics-top-courts-table";
import { OwnerOnboardingEmptyState } from "@/components/dashboard/owner-onboarding-empty-state";
import { OwnerRecentBookingsTable } from "@/components/dashboard/owner-recent-bookings-table";
import type { OwnerAnalyticsDashboardData } from "@/domains/analytics/types";
import { formatBookingDate } from "@/domains/booking/utils/booking-display";

type AnalyticsDashboardProps = {
  data: OwnerAnalyticsDashboardData;
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Analitik
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Analitik Operasional
        </h1>
        <p className="text-muted-foreground text-sm">
          Ringkasan booking dan performa venue untuk periode{" "}
          {formatBookingDate(data.period.from)} –{" "}
          {formatBookingDate(data.period.to)}.
        </p>
      </div>

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
