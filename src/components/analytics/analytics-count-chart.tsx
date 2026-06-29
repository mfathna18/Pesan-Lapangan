import type { AnalyticsCountPoint } from "@/domains/booking/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AnalyticsCountChartProps = {
  title: string;
  description: string;
  data: AnalyticsCountPoint[];
  formatLabel?: (label: string) => string;
  minWidthClass?: string;
};

function defaultFormatLabel(label: string): string {
  return label;
}

function formatDayLabel(label: string): string {
  const [, month, day] = label.split("-");

  return `${day}/${month}`;
}

export function AnalyticsCountChart({
  title,
  description,
  data,
  formatLabel = defaultFormatLabel,
  minWidthClass = "min-w-[640px]",
}: AnalyticsCountChartProps) {
  const maxCount = Math.max(...data.map((point) => point.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className={`flex h-56 ${minWidthClass} items-end gap-1.5`}>
              {data.map((point) => {
                const heightPercent = (point.count / maxCount) * 100;

                return (
                  <div
                    key={`${title}-${point.label}`}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="bg-primary/10 flex h-40 w-full items-end rounded-md"
                      title={`${formatLabel(point.label)}: ${point.count}`}
                    >
                      <div
                        className="bg-primary w-full rounded-md transition-all"
                        style={{
                          height:
                            point.count > 0
                              ? `${Math.max(heightPercent, 6)}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground text-[10px]">
                      {formatLabel(point.label)}
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

export { formatDayLabel };
