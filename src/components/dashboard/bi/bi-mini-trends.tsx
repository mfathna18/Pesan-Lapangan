import type { BiTrendSeries } from "@/domains/analytics/analytics-types";
import { formatRevenueValue } from "@/domains/analytics/analytics-formatters";
import { radius, shadow, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type BiMiniTrendsProps = {
  trends: BiTrendSeries[];
};

function formatTrendValue(seriesId: string, value: number): string {
  if (seriesId === "revenue-trend") {
    return formatRevenueValue(value);
  }

  return value.toLocaleString("id-ID");
}

function MiniTrendChart({ series }: { series: BiTrendSeries }) {
  const maxValue = Math.max(...series.points.map((point) => point.value), 1);
  const isRevenue = series.id === "revenue-trend";

  return (
    <article
      className={cn(
        "border-border bg-card space-y-4 border p-5",
        radius.card,
        shadow.card,
      )}
    >
      <div className="space-y-1">
        <h3 className={typography.cardTitle}>{series.title}</h3>
        <p className={typography.caption}>{series.calculation}</p>
      </div>

      <div className="flex h-36 items-end gap-2">
        {series.points.map((point) => {
          const heightPercent = Math.max(
            4,
            Math.round((point.value / maxValue) * 100),
          );

          return (
            <div
              key={`${series.id}-${point.label}`}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="text-muted-foreground text-[10px] tabular-nums">
                {isRevenue && point.value > 0
                  ? `${Math.round(point.value / 1000)}k`
                  : point.value > 0
                    ? point.value
                    : ""}
              </span>
              <div className="bg-muted flex h-24 w-full items-end rounded-md">
                <div
                  className={cn(
                    "w-full rounded-md",
                    isRevenue ? "bg-emerald-500/80" : "bg-primary/80",
                  )}
                  style={{ height: `${heightPercent}%` }}
                  title={`${point.label}: ${formatTrendValue(series.id, point.value)}`}
                />
              </div>
              <span className="text-muted-foreground truncate text-[10px]">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function BiMiniTrends({ trends }: BiMiniTrendsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className={typography.h3}>Tren Singkat</h2>
        <p className={typography.caption}>
          Pergerakan 7 hari terakhir tanpa chart library berat.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {trends.map((series) => (
          <MiniTrendChart key={series.id} series={series} />
        ))}
      </div>
    </section>
  );
}
