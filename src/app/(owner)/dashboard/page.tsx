import { BusinessIntelligenceDashboard } from "@/components/dashboard/business-intelligence-dashboard";
import { createPageMetadata } from "@/config/page-metadata";
import { getAnalyticsService } from "@/domains/analytics/analytics-actions";
import { getManualPaymentService } from "@/domains/payment/actions/get-manual-payment-service";
import { getPushService } from "@/domains/push/actions/get-push-service";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = createPageMetadata(
  "Beranda",
  "Dasbor bisnis venue — KPI, insight, rekomendasi, dan tren performa.",
);

export default async function DashboardPage() {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  const [dashboardData, awaitingPayments, browserNotificationSettings] =
    await Promise.all([
      getAnalyticsService().getBusinessIntelligenceDashboard(ownerId),
      getManualPaymentService().listAwaitingConfirmation(ownerId),
      getPushService().getSettingsForOwner(ownerId),
    ]);

  return (
    <BusinessIntelligenceDashboard
      data={dashboardData}
      awaitingPayments={awaitingPayments}
      browserNotificationSettings={browserNotificationSettings}
    />
  );
}
