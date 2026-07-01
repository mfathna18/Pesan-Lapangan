import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { createPageMetadata } from "@/config/page-metadata";
import { getOwnerAnalyticsService } from "@/domains/analytics/actions/get-owner-analytics-service";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = createPageMetadata(
  "Analitik",
  "Analitik operasional venue, lapangan terlaris, dan distribusi booking.",
);

export default async function DashboardAnalyticsPage() {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  const analyticsData = await getOwnerAnalyticsService().getDashboard(ownerId);

  return <AnalyticsDashboard data={analyticsData} />;
}
