import { AdminVenuesTable } from "@/components/admin/admin-venues-table";
import { PageHeader } from "@/components/ui/page-header";
import { createPageMetadata } from "@/config/page-metadata";
import { getAdminService } from "@/domains/admin/actions/get-admin-service";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin-session";
import { layout } from "@/lib/design-system";

export const metadata = createPageMetadata(
  "Venues",
  "Daftar venue terdaftar di platform.",
);

export default async function AdminVenuesPage() {
  await requireSuperAdminSession();
  const venues = await getAdminService().listVenues();

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Super Admin"
        title="Venue Management"
        description="Lihat semua venue dan statusnya. Mode baca saja."
      />

      <AdminVenuesTable venues={venues} />
    </div>
  );
}
