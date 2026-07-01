import type { RevenueDashboardData } from "@/domains/payment/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RevenueSummaryCardsProps = {
  summary: RevenueDashboardData["summary"];
};

export function RevenueSummaryCards({ summary }: RevenueSummaryCardsProps) {
  const cards = [
    {
      title: "Pendapatan Hari Ini",
      value: formatCurrency(summary.todayRevenue),
    },
    {
      title: "Pendapatan Bulan Ini",
      value: formatCurrency(summary.monthRevenue),
    },
    {
      title: "Pembayaran Selesai",
      value: summary.completedPayments.toLocaleString("id-ID"),
    },
    {
      title: "Pembayaran Tertunda",
      value: summary.pendingPayments.toLocaleString("id-ID"),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
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
