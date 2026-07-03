import { BiKpiCardsPolling } from "@/components/dashboard/bi/bi-kpi-cards-polling";
import { BiActivityTimeline } from "@/components/dashboard/bi/bi-activity-timeline";
import { BiMiniTrends } from "@/components/dashboard/bi/bi-mini-trends";
import { BiQuickActions } from "@/components/dashboard/bi/bi-quick-actions";
import { BiRecommendations } from "@/components/dashboard/bi/bi-recommendations";
import { OwnerOnboardingEmptyState } from "@/components/dashboard/owner-onboarding-empty-state";
import { BiInsightCards } from "@/components/dashboard/bi/bi-insight-cards";
import { OwnerPendingPaymentsPollingWidget } from "@/components/dashboard/owner-pending-payments-polling-widget";
import { PageHeader } from "@/components/ui/page-header";
import type { BusinessIntelligenceDashboardData } from "@/domains/analytics/analytics-types";
import type { AwaitingConfirmationPaymentItem } from "@/domains/payment/types";
import { formatBookingDate } from "@/domains/booking/utils/booking-display";
import { layout } from "@/lib/design-system";

type BusinessIntelligenceDashboardProps = {
  data: BusinessIntelligenceDashboardData;
  awaitingPayments?: AwaitingConfirmationPaymentItem[];
};

export function BusinessIntelligenceDashboard({
  data,
  awaitingPayments = [],
}: BusinessIntelligenceDashboardProps) {
  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Intelligence"
        title="Dasbor Bisnis"
        description={`Ringkasan performa venue untuk ${formatBookingDate(data.period.from)} – ${formatBookingDate(data.period.to)}. Dibandingkan dengan periode ${formatBookingDate(data.period.comparisonFrom)} – ${formatBookingDate(data.period.comparisonTo)}.`}
      />

      {!data.hasData ? (
        <OwnerOnboardingEmptyState
          title="Belum ada data bisnis"
          description="Dasbor bisnis akan menampilkan KPI, insight, rekomendasi, dan tren setelah venue Anda memiliki lapangan dan booking pertama."
        />
      ) : (
        <div className="flex flex-col gap-10">
          <OwnerPendingPaymentsPollingWidget initialItems={awaitingPayments} />
          <BiKpiCardsPolling initialKpis={data.kpis} />
          <BiRecommendations recommendations={data.recommendations} />
          <BiInsightCards insights={data.insights} />
          <BiMiniTrends trends={data.trends} />
          <BiActivityTimeline events={data.activity} />
          <BiQuickActions actions={data.quickActions} />
        </div>
      )}
    </div>
  );
}
