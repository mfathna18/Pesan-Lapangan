import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { createPageMetadata } from "@/config/page-metadata";
import { getAnalyticsService } from "@/domains/analytics/analytics-actions";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = createPageMetadata(
  "Analitik",
  "Analitik operasional booking, lapangan, dan distribusi olahraga.",
);

export default async function DashboardAnalyticsPage() {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  const analyticsData = await getAnalyticsService().getDashboard(ownerId);

  return <AnalyticsDashboard data={analyticsData} />;
}
