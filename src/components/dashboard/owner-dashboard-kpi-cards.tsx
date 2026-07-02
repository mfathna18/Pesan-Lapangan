import type { OwnerOperationalDashboardData } from "@/domains/analytics/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type OwnerDashboardKpiCardsProps = {
  kpis: OwnerOperationalDashboardData["kpis"];
};

export function OwnerDashboardKpiCards({ kpis }: OwnerDashboardKpiCardsProps) {
  const primaryCards = [
    {
      title: "Booking Hari Ini",
      value: kpis.bookingsToday.toLocaleString("id-ID"),
      highlight: false,
    },
    {
      title: "Booking Bulan Ini",
      value: kpis.bookingsThisMonth.toLocaleString("id-ID"),
      highlight: false,
    },
    {
      title: "Pendapatan Bulan Ini",
      value: formatCurrency(kpis.revenueThisMonth),
      highlight: true,
    },
    {
      title: "Lapangan Aktif",
      value: kpis.activeCourts.toLocaleString("id-ID"),
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className={typography.label}>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={cn(
                  typography.stat,
                  card.highlight && "text-primary",
                )}
              >
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={typography.label}>
            Menunggu Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn(typography.stat, "text-warning-foreground")}>
            {kpis.pendingPayments.toLocaleString("id-ID")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
