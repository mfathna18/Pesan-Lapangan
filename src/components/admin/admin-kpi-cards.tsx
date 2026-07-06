import type { AdminDashboardKpis } from "@/domains/admin/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { typography } from "@/lib/design-system";
import { pageLayout } from "@/lib/layout-system";

type AdminKpiCardsProps = {
  kpis: AdminDashboardKpis;
};

function AdminKpiCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={typography.label}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={typography.stat}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function AdminKpiCards({ kpis }: AdminKpiCardsProps) {
  return (
    <div className={pageLayout.statGrid}>
      <AdminKpiCard title="Total Owners" value={String(kpis.totalOwners)} />
      <AdminKpiCard title="Total Venues" value={String(kpis.totalVenues)} />
      <AdminKpiCard title="Total Courts" value={String(kpis.totalCourts)} />
      <AdminKpiCard title="Total Bookings" value={String(kpis.totalBookings)} />
      <AdminKpiCard
        title="Today's Bookings"
        value={String(kpis.todayBookings)}
      />
      <AdminKpiCard
        title="Monthly Revenue"
        value={formatCurrency(kpis.monthlyRevenue)}
      />
      <AdminKpiCard
        title="Active Subscriptions"
        value={String(kpis.activeSubscriptions)}
      />
      <AdminKpiCard
        title="Expired Subscriptions"
        value={String(kpis.expiredSubscriptions)}
      />
    </div>
  );
}
