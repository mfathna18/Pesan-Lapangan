import { BusinessIntelligenceDashboard } from "@/components/dashboard/business-intelligence-dashboard";
import { createPageMetadata } from "@/config/page-metadata";
import { getAnalyticsService } from "@/domains/analytics/analytics-actions";
import { getManualPaymentService } from "@/domains/payment/actions/get-manual-payment-service";
import {
  getCachedCurrentSubscription,
  getCachedOwnerId,
  getCachedOwnerSession,
  getCachedPushSettings,
} from "@/lib/auth/cached-owner-request";

export const metadata = createPageMetadata(
  "Beranda",
  "Dasbor bisnis venue — KPI, insight, rekomendasi, dan tren performa.",
);

export default async function DashboardPage() {
  const session = await getCachedOwnerSession();
  const ownerId = await getCachedOwnerId(session.user.id);

  const [
    dashboardData,
    awaitingPayments,
    browserNotificationSettings,
    subscription,
  ] = await Promise.all([
    getAnalyticsService().getBusinessIntelligenceDashboard(ownerId),
    getManualPaymentService().listAwaitingConfirmation(ownerId),
    getCachedPushSettings(ownerId),
    getCachedCurrentSubscription(session.user.id),
  ]);

  return (
    <BusinessIntelligenceDashboard
      data={dashboardData}
      awaitingPayments={awaitingPayments}
      browserNotificationSettings={browserNotificationSettings}
      subscriptionPlan={subscription.plan}
      courtCapacity={subscription.courtCapacity}
    />
  );
}
