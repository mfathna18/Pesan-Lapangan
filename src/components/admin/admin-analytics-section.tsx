import type { AdminTrendPoint } from "@/domains/admin/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminBarChartProps = {
  title: string;
  description: string;
  data: AdminTrendPoint[];
  valueFormatter?: (value: number) => string;
};

export function AdminBarChart({
  title,
  description,
  data,
  valueFormatter = (value) => String(value),
}: AdminBarChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada data.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex h-56 min-w-[480px] items-end gap-2">
              {data.map((point) => {
                const heightPercent = (point.value / maxValue) * 100;

                return (
                  <div
                    key={point.label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="bg-primary/10 flex h-40 w-full items-end rounded-md"
                      title={`${point.label}: ${valueFormatter(point.value)}`}
                    >
                      <div
                        className="bg-primary w-full rounded-md transition-all"
                        style={{
                          height:
                            point.value > 0
                              ? `${Math.max(heightPercent, 6)}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground text-[10px]">
                      {point.label}
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

type AdminAnalyticsSectionProps = {
  newOwnersLast30Days: number;
  revenueTrend: AdminTrendPoint[];
  bookingsTrend: AdminTrendPoint[];
  popularSports: Array<{ sport: string; count: number }>;
};

function formatSportLabel(sport: string): string {
  return sport
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function AdminAnalyticsSection({
  newOwnersLast30Days,
  revenueTrend,
  bookingsTrend,
  popularSports,
}: AdminAnalyticsSectionProps) {
  const maxSportCount = Math.max(
    ...popularSports.map((sport) => sport.count),
    1,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>New Owners (30 days)</CardTitle>
          <CardDescription>Registrasi pemilik venue baru</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">
            {newOwnersLast30Days}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Sports</CardTitle>
          <CardDescription>Berdasarkan jumlah lapangan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {popularSports.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada data.</p>
          ) : (
            popularSports.map((sport) => (
              <div key={sport.sport} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{formatSportLabel(sport.sport)}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {sport.count}
                  </span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${Math.max((sport.count / maxSportCount) * 100, 4)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AdminBarChart
        title="Revenue Trend"
        description="Pendapatan langganan SaaS (6 bulan)"
        data={revenueTrend}
        valueFormatter={formatCurrency}
      />

      <AdminBarChart
        title="Bookings Trend"
        description="Jumlah booking baru (6 bulan)"
        data={bookingsTrend}
      />
    </div>
  );
}
