import {
  buildRevenueDashboardInput,
  RevenueDashboard,
} from "@/components/revenue/revenue-dashboard";
import { getPaymentService } from "@/domains/payment/actions/get-payment-service";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = {
  title: "Revenue Dashboard",
};

type DashboardPageProps = {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  await requireOwnerSession();

  const resolvedSearchParams = await searchParams;
  const revenueData = await getPaymentService().getRevenueDashboard(
    buildRevenueDashboardInput(resolvedSearchParams),
  );

  return (
    <RevenueDashboard data={revenueData} searchParams={resolvedSearchParams} />
  );
}
