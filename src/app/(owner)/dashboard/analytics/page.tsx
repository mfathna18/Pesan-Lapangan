import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getBookingService } from "@/domains/booking/actions/get-booking-service";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = {
  title: "Analytics Dashboard",
};

export default async function DashboardAnalyticsPage() {
  await requireOwnerSession();

  const analyticsData = await getBookingService().getAnalyticsDashboard();

  return <AnalyticsDashboard data={analyticsData} />;
}
