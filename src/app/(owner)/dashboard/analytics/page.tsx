import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getBookingService } from "@/domains/booking/actions/get-booking-service";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = {
  title: "Analytics Dashboard",
};

export default async function DashboardAnalyticsPage() {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  const analyticsData =
    await getBookingService().getAnalyticsDashboard(ownerId);

  return <AnalyticsDashboard data={analyticsData} />;
}
