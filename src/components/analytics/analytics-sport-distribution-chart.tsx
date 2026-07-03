import type { OwnerAnalyticsSportDistributionRow } from "@/domains/analytics/analytics-types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AnalyticsSportDistributionChartProps = {
  data: OwnerAnalyticsSportDistributionRow[];
};

export function AnalyticsSportDistributionChart({
  data,
}: AnalyticsSportDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Olahraga</CardTitle>
        <CardDescription>
          Booking berdasarkan jenis olahraga lapangan bulan ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Belum ada data distribusi olahraga bulan ini.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const widthPercent = (item.count / maxCount) * 100;
              const sharePercent =
                total > 0 ? Math.round((item.count / total) * 100) : 0;

              return (
                <div key={item.sportType} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">
                      {item.count.toLocaleString("id-ID")} ({sharePercent}%)
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(widthPercent, item.count > 0 ? 6 : 0)}%`,
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
