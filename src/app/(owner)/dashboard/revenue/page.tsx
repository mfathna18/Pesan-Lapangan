import { Suspense } from "react";

import {
  buildRevenueDashboardInput,
  RevenueDashboard,
} from "@/components/revenue/revenue-dashboard";
import { createPageMetadata } from "@/config/page-metadata";
import { getPaymentService } from "@/domains/payment/actions/get-payment-service";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = createPageMetadata(
  "Pendapatan",
  "Pantau pendapatan venue, transaksi pembayaran, dan riwayat pembayaran terbaru.",
);

type DashboardRevenuePageProps = {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function DashboardRevenuePage({
  searchParams,
}: DashboardRevenuePageProps) {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);
  const resolvedSearchParams = await searchParams;
  const input = buildRevenueDashboardInput(resolvedSearchParams);
  const data = await getPaymentService().getRevenueDashboard({
    ownerId,
    ...input,
  });

  return (
    <Suspense fallback={null}>
      <RevenueDashboard data={data} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
