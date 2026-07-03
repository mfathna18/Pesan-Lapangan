import { createAnalyticsRepository } from "@/domains/analytics/analytics-repository";
import { createAnalyticsService } from "@/domains/analytics/analytics-service";
import { prisma } from "@/lib/db/prisma";

export function getAnalyticsService() {
  const analyticsRepository = createAnalyticsRepository(prisma);

  return createAnalyticsService({ analyticsRepository });
}

/** @deprecated Use getAnalyticsService */
export function getOwnerAnalyticsService() {
  return getAnalyticsService();
}
