import { Suspense } from "react";

import { AdminOwnersTable } from "@/components/admin/admin-owners-table";
import { PageHeader } from "@/components/ui/page-header";
import { createPageMetadata } from "@/config/page-metadata";
import { getAdminService } from "@/domains/admin/actions/get-admin-service";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/generated/prisma/client";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin-session";
import { layout } from "@/lib/design-system";

export const metadata = createPageMetadata(
  "Owners",
  "Daftar pemilik venue terdaftar di platform.",
);

type AdminOwnersPageProps = {
  searchParams: Promise<{
    q?: string;
    plan?: string;
    status?: string;
    page?: string;
  }>;
};

function parsePlan(value?: string): SubscriptionPlan | undefined {
  if (
    value === "FREE" ||
    value === "STARTER" ||
    value === "PRO" ||
    value === "ELITE"
  ) {
    return value;
  }

  return undefined;
}

function parseStatus(value?: string): SubscriptionStatus | undefined {
  if (
    value === "TRIAL" ||
    value === "ACTIVE" ||
    value === "GRACE_PERIOD" ||
    value === "EXPIRED" ||
    value === "CANCELLED"
  ) {
    return value;
  }

  return undefined;
}

export default async function AdminOwnersPage({
  searchParams,
}: AdminOwnersPageProps) {
  await requireSuperAdminSession();
  const resolved = await searchParams;
  const page = Math.max(1, Number.parseInt(resolved.page ?? "1", 10) || 1);

  const data = await getAdminService().listOwners({
    search: resolved.q,
    plan: parsePlan(resolved.plan),
    status: parseStatus(resolved.status),
    page,
  });

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Super Admin"
        title="Owner Management"
        description="Lihat daftar pemilik venue. Mode baca saja — tidak ada pengeditan."
      />

      <Suspense fallback={null}>
        <AdminOwnersTable data={data} searchParams={resolved} />
      </Suspense>
    </div>
  );
}
