"use client";

import { useCallback, useEffect, useState } from "react";

import { BiKpiCards } from "@/components/dashboard/bi/bi-kpi-cards";
import { POLL_INTERVALS } from "@/config/polling-intervals";
import { getBusinessIntelligenceDashboardAction } from "@/domains/analytics/actions/get-bi-dashboard.action";
import type { BusinessIntelligenceDashboardData } from "@/domains/analytics/analytics-types";
import { usePolling } from "@/hooks/use-polling";

type BiKpiCardsPollingProps = {
  initialKpis: BusinessIntelligenceDashboardData["kpis"];
};

export function BiKpiCardsPolling({ initialKpis }: BiKpiCardsPollingProps) {
  const [kpis, setKpis] = useState(initialKpis);

  useEffect(() => {
    setKpis(initialKpis);
  }, [initialKpis]);

  const refreshKpis = useCallback(async () => {
    const response = await getBusinessIntelligenceDashboardAction();

    if (response.success) {
      setKpis(response.data.kpis);
    }
  }, []);

  usePolling(refreshKpis, POLL_INTERVALS.BI_KPI_MS);

  return <BiKpiCards kpis={kpis} />;
}
