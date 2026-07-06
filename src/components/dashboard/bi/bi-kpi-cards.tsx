import { memo } from "react";

import type { BusinessIntelligenceDashboardData } from "@/domains/analytics/analytics-types";
import { BiTrendIcon } from "@/components/dashboard/bi/bi-quick-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { typography } from "@/lib/design-system";
import { pageLayout } from "@/lib/layout-system";
import { cn } from "@/lib/utils";

type BiKpiCardsProps = {
  kpis: BusinessIntelligenceDashboardData["kpis"];
};

const OCCUPANCY_STATUS_STYLES = {
  excellent: "text-emerald-600",
  good: "text-primary",
  needs_attention: "text-amber-600",
} as const;

function KpiCard({
  title,
  value,
  periodLabel,
  calculation,
  trend,
  accent,
  statusLabel,
  status,
}: {
  title: string;
  value: string;
  periodLabel: string;
  calculation: string;
  trend: "up" | "down" | "flat";
  accent?: "green" | "default";
  statusLabel?: string;
  status?: "excellent" | "good" | "needs_attention";
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className={typography.label}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p
          className={cn(
            typography.stat,
            accent === "green" && "text-emerald-600",
            status && OCCUPANCY_STATUS_STYLES[status],
          )}
        >
          {value}
        </p>

        {statusLabel ? (
          <p
            className={cn(
              "text-sm font-semibold",
              status && OCCUPANCY_STATUS_STYLES[status],
            )}
          >
            {statusLabel}
          </p>
        ) : null}

        <div className="flex items-center gap-2">
          <BiTrendIcon trend={trend} />
          <p className="text-muted-foreground text-sm">{periodLabel}</p>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          {calculation}
        </p>
      </CardContent>
    </Card>
  );
}

export const BiKpiCards = memo(function BiKpiCards({ kpis }: BiKpiCardsProps) {
  return (
    <div className={pageLayout.statGrid}>
      <KpiCard
        title={kpis.revenue.title}
        value={kpis.revenue.value}
        periodLabel={kpis.revenue.comparison.periodLabel}
        calculation={kpis.revenue.calculation}
        trend={kpis.revenue.trend}
        accent="green"
      />
      <KpiCard
        title={kpis.bookings.title}
        value={kpis.bookings.value}
        periodLabel={kpis.bookings.comparison.periodLabel}
        calculation={kpis.bookings.calculation}
        trend={kpis.bookings.trend}
      />
      <KpiCard
        title={kpis.activeCustomers.title}
        value={kpis.activeCustomers.value}
        periodLabel={kpis.activeCustomers.comparison.periodLabel}
        calculation={kpis.activeCustomers.calculation}
        trend={kpis.activeCustomers.trend}
      />
      <KpiCard
        title={kpis.occupancy.title}
        value={kpis.occupancy.value}
        periodLabel={kpis.occupancy.comparison.periodLabel}
        calculation={kpis.occupancy.calculation}
        trend={kpis.occupancy.trend}
        status={kpis.occupancy.status}
        statusLabel={kpis.occupancy.statusLabel}
      />
    </div>
  );
});
