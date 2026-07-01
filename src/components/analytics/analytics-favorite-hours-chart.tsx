import type { OwnerAnalyticsCountPoint } from "@/domains/analytics/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AnalyticsFavoriteHoursChartProps = {
  data: OwnerAnalyticsCountPoint[];
};

export function AnalyticsFavoriteHoursChart({
  data,
}: AnalyticsFavoriteHoursChartProps) {
  const maxCount = Math.max(...data.map((point) => point.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jam Terfavorit</CardTitle>
        <CardDescription>
          Jam dengan booking terbanyak bulan ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Belum ada data jam booking bulan ini.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((point) => {
              const widthPercent = (point.count / maxCount) * 100;

              return (
                <div key={point.label} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{point.label}</span>
                    <span className="text-muted-foreground">
                      {point.count.toLocaleString("id-ID")} booking
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(widthPercent, point.count > 0 ? 6 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
