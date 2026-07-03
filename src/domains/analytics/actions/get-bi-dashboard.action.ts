"use server";

import { getAnalyticsService } from "@/domains/analytics/analytics-actions";
import type { BusinessIntelligenceDashboardData } from "@/domains/analytics/analytics-types";
import {
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { handleServerActionError } from "@/lib/server/actions";

export async function getBusinessIntelligenceDashboardAction(): Promise<
  ActionResponse<BusinessIntelligenceDashboardData>
> {
  try {
    const session = await requireOwnerSession();
    const ownerId = await requireOwnerId(session.user.id);
    const data =
      await getAnalyticsService().getBusinessIntelligenceDashboard(ownerId);

    return actionSuccess(data);
  } catch (error) {
    return handleServerActionError(
      "getBusinessIntelligenceDashboardAction",
      error,
      {
        fallbackMessage: "Gagal memuat dasbor bisnis.",
      },
    );
  }
}
