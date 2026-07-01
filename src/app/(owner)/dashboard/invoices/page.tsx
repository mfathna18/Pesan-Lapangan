import { InvoiceManagement } from "@/components/invoice/invoice-management";
import { createPageMetadata } from "@/config/page-metadata";

export const metadata = createPageMetadata(
  "Invoice",
  "Lihat dan unduh invoice dari booking yang sudah dibayar.",
);

export default function DashboardInvoicesPage() {
  return <InvoiceManagement />;
}
