import { createAnalyticsRepository } from "@/domains/analytics/repositories/analytics-repository";
import { createOwnerAnalyticsService } from "@/domains/analytics/services/owner-analytics-service";
import { prisma } from "@/lib/db/prisma";

export function getOwnerAnalyticsService() {
  const analyticsRepository = createAnalyticsRepository(prisma);

  return createOwnerAnalyticsService({ analyticsRepository });
}
