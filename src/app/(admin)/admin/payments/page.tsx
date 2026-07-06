import { AdminPaymentsTables } from "@/components/admin/admin-payments-tables";
import { PageHeader } from "@/components/ui/page-header";
import { createPageMetadata } from "@/config/page-metadata";
import { getAdminService } from "@/domains/admin/actions/get-admin-service";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin-session";
import { layout } from "@/lib/design-system";

export const metadata = createPageMetadata(
  "Payments",
  "Pembayaran langganan dan booking di platform.",
);

export default async function AdminPaymentsPage() {
  await requireSuperAdminSession();
  const [subscriptionPayments, bookingPayments] = await Promise.all([
    getAdminService().listSubscriptionPayments(),
    getAdminService().listBookingPayments(),
  ]);

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Super Admin"
        title="Payments"
        description="Riwayat pembayaran langganan SaaS dan booking pelanggan."
      />

      <AdminPaymentsTables
        subscriptionPayments={subscriptionPayments}
        bookingPayments={bookingPayments}
      />
    </div>
  );
}
