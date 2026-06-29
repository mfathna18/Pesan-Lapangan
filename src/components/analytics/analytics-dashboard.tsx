import {
  AnalyticsCountChart,
  formatDayLabel,
} from "@/components/analytics/analytics-count-chart";
import { AnalyticsSummaryCards } from "@/components/analytics/analytics-summary-cards";
import { AnalyticsTopCourtsTable } from "@/components/analytics/analytics-top-courts-table";
import { AnalyticsUtilizationChart } from "@/components/analytics/analytics-utilization-chart";
import type { AnalyticsDashboardData } from "@/domains/booking/types";
import { formatBookingDate } from "@/domains/booking/utils/booking-display";

type AnalyticsDashboardProps = {
  data: AnalyticsDashboardData;
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Operations
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          {formatBookingDate(data.period.from)} -{" "}
          {formatBookingDate(data.period.to)}
        </p>
      </div>

      <AnalyticsSummaryCards cards={data.cards} />

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsCountChart
          title="Bookings by Day"
          description="Daily booking volume in the current month"
          data={data.charts.bookingsByDay}
          formatLabel={formatDayLabel}
        />
        <AnalyticsCountChart
          title="Bookings by Hour"
          description="Booking distribution by start hour"
          data={data.charts.bookingsByHour}
          minWidthClass="min-w-[960px]"
        />
      </div>

      <AnalyticsUtilizationChart data={data.charts.courtUtilization} />

      <AnalyticsTopCourtsTable courts={data.topCourts} />
    </div>
  );
}
