import { AdminSubscriptionsTable } from "@/components/admin/admin-subscriptions-table";
import { PageHeader } from "@/components/ui/page-header";
import { createPageMetadata } from "@/config/page-metadata";
import { getAdminService } from "@/domains/admin/actions/get-admin-service";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin-session";
import { layout } from "@/lib/design-system";

export const metadata = createPageMetadata(
  "Subscriptions",
  "Langganan SaaS pemilik venue di platform.",
);

export default async function AdminSubscriptionsPage() {
  await requireSuperAdminSession();
  const subscriptions = await getAdminService().listSubscriptions();

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Super Admin"
        title="Subscriptions"
        description="Pantau langganan pemilik venue, status, dan sisa masa aktif."
      />

      <AdminSubscriptionsTable subscriptions={subscriptions} />
    </div>
  );
}
