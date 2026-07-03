import { Suspense } from "react";

import { ExportDropdown } from "@/components/export/export-dropdown";
import { RevenueChart } from "@/components/revenue/revenue-chart";
import { RevenueDateRangeFilter } from "@/components/revenue/revenue-date-range-filter";
import { RevenuePaymentsTable } from "@/components/revenue/revenue-payments-table";
import { RevenueSummaryCards } from "@/components/revenue/revenue-summary-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import type { RevenueDashboardData } from "@/domains/payment/types";
import {
  parseOptionalDateInput,
  parseRevenueDateRangePreset,
} from "@/domains/payment/utils/revenue-date-range";
import { layout } from "@/lib/design-system";
import { pageLayout } from "@/lib/layout-system";

type RevenueDashboardProps = {
  data: RevenueDashboardData;
  searchParams: {
    range?: string;
    from?: string;
    to?: string;
  };
};

function formatDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export function RevenueDashboard({
  data,
  searchParams,
}: RevenueDashboardProps) {
  const preset = parseRevenueDateRangePreset(searchParams.range);
  const exportParams = {
    range: preset,
    from:
      searchParams.from ??
      (preset === "custom"
        ? formatDateInputValue(data.dateRange.from)
        : undefined),
    to:
      searchParams.to ??
      (preset === "custom"
        ? formatDateInputValue(data.dateRange.to)
        : undefined),
  };

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Bisnis"
        title="Dasbor Pendapatan"
        description="Pantau pendapatan venue, transaksi pembayaran, dan riwayat pembayaran terbaru."
        actions={
          <ExportDropdown
            label="Export"
            endpoint="/api/owner/export/revenue"
            params={exportParams}
          />
        }
      />

      <div className={pageLayout.cardStack}>
        <RevenueSummaryCards summary={data.summary} />

        <RevenueChart data={data.chart} />

        <Card>
          <CardHeader>
            <CardTitle>Filter Pembayaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <p className="text-muted-foreground text-sm">
                  Memuat filter...
                </p>
              }
            >
              <RevenueDateRangeFilter
                preset={preset}
                customFrom={
                  searchParams.from ??
                  (preset === "custom"
                    ? formatDateInputValue(data.dateRange.from)
                    : undefined)
                }
                customTo={
                  searchParams.to ??
                  (preset === "custom"
                    ? formatDateInputValue(data.dateRange.to)
                    : undefined)
                }
              />
            </Suspense>
          </CardContent>
        </Card>

        <RevenuePaymentsTable payments={data.recentPayments} />
      </div>
    </div>
  );
}

export function buildRevenueDashboardInput(searchParams: {
  range?: string;
  from?: string;
  to?: string;
}) {
  const preset = parseRevenueDateRangePreset(searchParams.range);

  return {
    preset,
    customFrom: parseOptionalDateInput(searchParams.from),
    customTo: parseOptionalDateInput(searchParams.to),
  };
}
