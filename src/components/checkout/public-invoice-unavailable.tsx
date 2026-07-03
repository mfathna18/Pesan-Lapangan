import Link from "next/link";
import { FileText } from "lucide-react";

import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { customerLayout } from "@/lib/customer-layout";

type PublicInvoiceUnavailableProps = {
  venueSlug: string;
  venueName: string;
  bookingId: string;
};

export function PublicInvoiceUnavailable({
  venueSlug,
  venueName,
  bookingId,
}: PublicInvoiceUnavailableProps) {
  const successHref = `/gor/${venueSlug}/checkout/${bookingId}/success`;
  const checkoutHref = `/gor/${venueSlug}/checkout/${bookingId}`;

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader gorSlug={venueSlug} gorName={venueName} />
      <main className={customerLayout.page}>
        <div
          className={`${customerLayout.container} ${customerLayout.funnelStack}`}
        >
          <EmptyState
            icon={FileText}
            title={CUSTOMER_COPY.invoice.unavailableTitle}
            description={CUSTOMER_COPY.invoice.unavailableDescription}
            tips={
              <p className="text-center">
                {CUSTOMER_COPY.invoice.unavailableHint}
              </p>
            }
            action={
              <Link
                href={successHref}
                className={buttonVariants({ size: "lg" })}
              >
                {CUSTOMER_COPY.invoice.viewBookingStatus}
              </Link>
            }
            secondaryAction={
              <Link
                href={checkoutHref}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                {CUSTOMER_COPY.invoice.backToPayment}
              </Link>
            }
          />
        </div>
      </main>
    </div>
  );
}
