import { AdminSystemStatusPanel } from "@/components/admin/admin-system-status-panel";
import { PageHeader } from "@/components/ui/page-header";
import { appVersion } from "@/config/site";
import { createPageMetadata } from "@/config/page-metadata";
import { getAdminService } from "@/domains/admin/actions/get-admin-service";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin-session";
import { layout } from "@/lib/design-system";

export const metadata = createPageMetadata(
  "System",
  "Status infrastruktur dan informasi deployment platform.",
);

export default async function AdminSystemPage() {
  await requireSuperAdminSession();
  const status = await getAdminService().getSystemStatus(
    appVersion,
    process.env.NODE_ENV ?? "development",
  );

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Super Admin"
        title="System"
        description="Kesehatan database, storage, dan informasi deployment."
      />

      <AdminSystemStatusPanel status={status} />
    </div>
  );
}
