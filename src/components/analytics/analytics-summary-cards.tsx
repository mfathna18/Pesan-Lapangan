import type { OwnerAnalyticsDashboardData } from "@/domains/analytics/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AnalyticsSummaryCardsProps = {
  kpis: OwnerAnalyticsDashboardData["kpis"];
};

export function AnalyticsSummaryCards({ kpis }: AnalyticsSummaryCardsProps) {
  const summaryCards = [
    {
      title: "Booking Hari Ini",
      value: kpis.bookingsToday.toLocaleString("id-ID"),
    },
    {
      title: "Booking Minggu Ini",
      value: kpis.bookingsThisWeek.toLocaleString("id-ID"),
    },
    {
      title: "Booking Bulan Ini",
      value: kpis.bookingsThisMonth.toLocaleString("id-ID"),
    },
    {
      title: "Pendapatan Bulan Ini",
      value: formatCurrency(kpis.revenueThisMonth),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
