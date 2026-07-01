import { Suspense } from "react";

import { RevenueChart } from "@/components/revenue/revenue-chart";
import { RevenueDateRangeFilter } from "@/components/revenue/revenue-date-range-filter";
import { RevenuePaymentsTable } from "@/components/revenue/revenue-payments-table";
import { RevenueSummaryCards } from "@/components/revenue/revenue-summary-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueDashboardData } from "@/domains/payment/types";
import {
  parseOptionalDateInput,
  parseRevenueDateRangePreset,
} from "@/domains/payment/utils/revenue-date-range";

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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Ringkasan
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Dasbor Pendapatan
        </h1>
      </div>

      <RevenueSummaryCards summary={data.summary} />

      <RevenueChart data={data.chart} />

      <Card>
        <CardHeader>
          <CardTitle>Filter Pembayaran Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <p className="text-muted-foreground text-sm">Memuat filter...</p>
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
