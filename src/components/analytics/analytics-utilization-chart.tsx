import type { AnalyticsUtilizationPoint } from "@/domains/booking/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AnalyticsUtilizationChartProps = {
  data: AnalyticsUtilizationPoint[];
};

export function AnalyticsUtilizationChart({
  data,
}: AnalyticsUtilizationChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisasi Lapangan</CardTitle>
        <CardDescription>Persentase okupansi per lapangan</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Tidak ada lapangan tersedia.
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((court) => (
              <div key={court.courtId} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium">{court.courtName}</span>
                  <span className="text-muted-foreground">
                    {court.occupancyPercent}%
                  </span>
                </div>
                <div className="bg-primary/10 h-3 rounded-full">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${court.occupancyPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
