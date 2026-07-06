"use server";

import { getAnalyticsService } from "@/domains/analytics/analytics-actions";
import type { BusinessIntelligenceDashboardData } from "@/domains/analytics/analytics-types";
import {
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import {
  getCachedOwnerId,
  getCachedOwnerSession,
} from "@/lib/auth/cached-owner-request";
import { handleServerActionError } from "@/lib/server/actions";

export async function getBusinessIntelligenceKpisAction(): Promise<
  ActionResponse<BusinessIntelligenceDashboardData["kpis"]>
> {
  const session = await getCachedOwnerSession();
  const ownerId = await getCachedOwnerId(session.user.id);

  try {
    const kpis =
      await getAnalyticsService().getBusinessIntelligenceKpis(ownerId);

    return actionSuccess(kpis);
  } catch (error) {
    return handleServerActionError("getBusinessIntelligenceKpisAction", error, {
      fallbackMessage: "Gagal memuat KPI dasbor bisnis.",
    });
  }
}
