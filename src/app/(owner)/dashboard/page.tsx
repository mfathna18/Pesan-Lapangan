import { OwnerOperationalDashboard } from "@/components/dashboard/owner-operational-dashboard";
import { createPageMetadata } from "@/config/page-metadata";
import { getOwnerAnalyticsService } from "@/domains/analytics/actions/get-owner-analytics-service";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = createPageMetadata(
  "Beranda",
  "Ringkasan operasional venue, booking, dan pendapatan.",
);

export default async function DashboardPage() {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  const dashboardData =
    await getOwnerAnalyticsService().getOperationalDashboard(ownerId);

  return <OwnerOperationalDashboard data={dashboardData} />;
}
