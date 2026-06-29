import type { RevenueByDayPoint } from "@/domains/payment/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RevenueChartProps = {
  data: RevenueByDayPoint[];
};

function formatChartLabel(date: string): string {
  const [, month, day] = date.split("-");

  return `${day}/${month}`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((point) => point.revenue), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Day</CardTitle>
        <CardDescription>Current month paid revenue</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No revenue recorded this month.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex h-56 min-w-[640px] items-end gap-1.5">
              {data.map((point) => {
                const heightPercent = (point.revenue / maxRevenue) * 100;

                return (
                  <div
                    key={point.date}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="bg-primary/10 flex h-40 w-full items-end rounded-md"
                      title={`${formatChartLabel(point.date)}: ${formatCurrency(point.revenue)}`}
                    >
                      <div
                        className="bg-primary w-full rounded-md transition-all"
                        style={{
                          height:
                            point.revenue > 0
                              ? `${Math.max(heightPercent, 6)}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground text-[10px]">
                      {formatChartLabel(point.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
