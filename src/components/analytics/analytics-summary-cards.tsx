import type { AnalyticsDashboardData } from "@/domains/booking/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AnalyticsSummaryCardsProps = {
  cards: AnalyticsDashboardData["cards"];
};

export function AnalyticsSummaryCards({ cards }: AnalyticsSummaryCardsProps) {
  const summaryCards = [
    {
      title: "Most Booked Court",
      value: cards.mostBookedCourt,
    },
    {
      title: "Peak Booking Hour",
      value: cards.peakBookingHour,
    },
    {
      title: "Peak Booking Day",
      value: cards.peakBookingDay,
    },
    {
      title: "Booking Success Rate",
      value: `${cards.bookingSuccessRate}%`,
    },
    {
      title: "Cancellation Rate",
      value: `${cards.cancellationRate}%`,
    },
    {
      title: "Court Utilization",
      value: `${cards.courtUtilization}%`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
