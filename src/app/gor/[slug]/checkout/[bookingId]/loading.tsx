import { CustomerFunnelSkeleton } from "@/components/customer/customer-funnel-skeleton";

export default function CheckoutLoading() {
  return (
    <div aria-live="polite" aria-busy="true">
      <span className="sr-only">Memuat halaman pembayaran...</span>
      <CustomerFunnelSkeleton />
    </div>
  );
}
