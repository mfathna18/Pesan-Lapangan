import { OWNER_ANALYTICS_RECENT_BOOKINGS_LIMIT } from "@/domains/analytics/constants";
import type { AnalyticsRepository } from "@/domains/analytics/repositories/analytics-repository";
import type {
  OwnerAnalyticsDashboardData,
  OwnerOperationalDashboardData,
} from "@/domains/analytics/types";
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "@/domains/analytics/utils/analytics-date-range";
import {
  buildOwnerAnalyticsDashboard,
  buildOwnerOperationalDashboard,
} from "@/domains/analytics/utils/owner-analytics";

type OwnerAnalyticsServiceDependencies = {
  analyticsRepository: AnalyticsRepository;
};

export class OwnerAnalyticsService {
  private readonly analyticsRepository: AnalyticsRepository;

  constructor({ analyticsRepository }: OwnerAnalyticsServiceDependencies) {
    this.analyticsRepository = analyticsRepository;
  }

  async getDashboard(
    ownerId: string,
    referenceDate: Date = new Date(),
  ): Promise<OwnerAnalyticsDashboardData> {
    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);
    const weekStart = startOfWeek(referenceDate);
    const weekEnd = endOfWeek(referenceDate);
    const queryStart = weekStart < monthStart ? weekStart : monthStart;
    const queryEnd = weekEnd > monthEnd ? weekEnd : monthEnd;

    const snapshot = await this.analyticsRepository.fetchOwnerAnalyticsSnapshot(
      {
        ownerId,
        queryStart,
        queryEnd,
        monthStart,
        monthEnd,
        recentBookingsLimit: OWNER_ANALYTICS_RECENT_BOOKINGS_LIMIT,
      },
    );

    return buildOwnerAnalyticsDashboard(snapshot, referenceDate);
  }

  async getOperationalDashboard(
    ownerId: string,
    referenceDate: Date = new Date(),
  ): Promise<OwnerOperationalDashboardData> {
    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);
    const weekStart = startOfWeek(referenceDate);
    const weekEnd = endOfWeek(referenceDate);
    const queryStart = weekStart < monthStart ? weekStart : monthStart;
    const queryEnd = weekEnd > monthEnd ? weekEnd : monthEnd;

    const snapshot = await this.analyticsRepository.fetchOwnerAnalyticsSnapshot(
      {
        ownerId,
        queryStart,
        queryEnd,
        monthStart,
        monthEnd,
        recentBookingsLimit: OWNER_ANALYTICS_RECENT_BOOKINGS_LIMIT,
      },
    );

    return buildOwnerOperationalDashboard(snapshot, referenceDate);
  }
}

export function createOwnerAnalyticsService(
  dependencies: OwnerAnalyticsServiceDependencies,
): OwnerAnalyticsService {
  return new OwnerAnalyticsService(dependencies);
}
