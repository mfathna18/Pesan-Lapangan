import type { OwnerOperationalDashboardData } from "@/domains/analytics/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { typography } from "@/lib/design-system";

type OwnerDashboardKpiCardsProps = {
  kpis: OwnerOperationalDashboardData["kpis"];
};

export function OwnerDashboardKpiCards({ kpis }: OwnerDashboardKpiCardsProps) {
  const primaryCards = [
    {
      title: "Booking Hari Ini",
      value: kpis.bookingsToday.toLocaleString("id-ID"),
    },
    {
      title: "Booking Bulan Ini",
      value: kpis.bookingsThisMonth.toLocaleString("id-ID"),
    },
    {
      title: "Pendapatan Bulan Ini",
      value: formatCurrency(kpis.revenueThisMonth),
    },
    {
      title: "Lapangan Aktif",
      value: kpis.activeCourts.toLocaleString("id-ID"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-1">
              <CardTitle className={typography.caption}>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className={typography.caption}>
            Menunggu Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {kpis.pendingPayments.toLocaleString("id-ID")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
