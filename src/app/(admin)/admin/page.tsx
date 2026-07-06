import { AdminAnalyticsSection } from "@/components/admin/admin-analytics-section";
import { AdminKpiCards } from "@/components/admin/admin-kpi-cards";
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity";
import { PageHeader } from "@/components/ui/page-header";
import { createPageMetadata } from "@/config/page-metadata";
import { getAdminService } from "@/domains/admin/actions/get-admin-service";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin-session";
import { layout } from "@/lib/design-system";
import { pageLayout } from "@/lib/layout-system";

export const metadata = createPageMetadata(
  "Admin Dashboard",
  "Monitor platform PesanLapangan — KPI, aktivitas, dan analitik.",
);

export default async function AdminDashboardPage() {
  await requireSuperAdminSession();
  const data = await getAdminService().getDashboard();

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Super Admin"
        title="Platform Dashboard"
        description="Pantau kesehatan platform, pertumbuhan pemilik venue, dan aktivitas terbaru."
      />

      <div className={pageLayout.cardStack}>
        <AdminKpiCards kpis={data.kpis} />
        <AdminRecentActivity
          bookings={data.recentBookings}
          registrations={data.recentRegistrations}
          subscriptions={data.recentSubscriptions}
          payments={data.recentPayments}
        />
        <AdminAnalyticsSection
          newOwnersLast30Days={data.newOwnersLast30Days}
          revenueTrend={data.revenueTrend}
          bookingsTrend={data.bookingsTrend}
          popularSports={data.popularSports}
        />
      </div>
    </div>
  );
}
