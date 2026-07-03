import type { AnalyticsRepository } from "./analytics-repository";
import {
  buildBusinessIntelligenceDashboard,
  buildOwnerAnalyticsDashboard,
} from "./analytics-mappers";
import { ANALYTICS_LIMITS } from "./analytics-types";
import type {
  BusinessIntelligenceDashboardData,
  OwnerAnalyticsDashboardData,
} from "./analytics-types";
import {
  endOfMonth,
  endOfWeek,
  previousMonthRange,
  startOfMonth,
  startOfWeek,
  trendRange,
} from "./analytics-utils";

type AnalyticsServiceDependencies = {
  analyticsRepository: AnalyticsRepository;
};

export class AnalyticsService {
  private readonly analyticsRepository: AnalyticsRepository;

  constructor({ analyticsRepository }: AnalyticsServiceDependencies) {
    this.analyticsRepository = analyticsRepository;
  }

  async getBusinessIntelligenceDashboard(
    ownerId: string,
    referenceDate: Date = new Date(),
  ): Promise<BusinessIntelligenceDashboardData> {
    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);
    const { start: previousMonthStart, end: previousMonthEnd } =
      previousMonthRange(referenceDate);
    const weekStart = startOfWeek(referenceDate);
    const weekEnd = endOfWeek(referenceDate);
    const { start: trendStart, end: trendEnd } = trendRange(
      referenceDate,
      ANALYTICS_LIMITS.TREND_DAYS,
    );

    const snapshot =
      await this.analyticsRepository.fetchBusinessIntelligenceSnapshot({
        ownerId,
        currentMonthStart: monthStart,
        currentMonthEnd: monthEnd,
        previousMonthStart,
        previousMonthEnd,
        trendStart,
        trendEnd,
        weekStart,
        weekEnd,
        queryStart: previousMonthStart,
        queryEnd: monthEnd,
        recentBookingsLimit: ANALYTICS_LIMITS.RECENT_BOOKINGS,
        activityLimit: ANALYTICS_LIMITS.ACTIVITY_EVENTS,
      });

    return buildBusinessIntelligenceDashboard(
      snapshot,
      referenceDate,
      ANALYTICS_LIMITS,
    );
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
        recentBookingsLimit: ANALYTICS_LIMITS.RECENT_BOOKINGS,
      },
    );

    return buildOwnerAnalyticsDashboard(
      snapshot,
      referenceDate,
      ANALYTICS_LIMITS.TOP_COURTS,
      ANALYTICS_LIMITS.TOP_HOURS,
    );
  }
}

export function createAnalyticsService(
  dependencies: AnalyticsServiceDependencies,
): AnalyticsService {
  return new AnalyticsService(dependencies);
}
