import { notFound, redirect } from "next/navigation";

import { CheckoutPaymentWaitingPoller } from "@/components/checkout/checkout-payment-waiting-poller";
import { CustomerFunnelHeader } from "@/components/customer/customer-funnel-header";
import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { getPublicCheckoutService } from "@/domains/payment/actions/get-public-checkout-service";
import { PublicCheckoutNotFoundError } from "@/domains/payment/errors";
import { customerLayout } from "@/lib/customer-layout";

type WaitingPaymentPageProps = {
  params: Promise<{
    slug: string;
    bookingId: string;
  }>;
};

export default async function WaitingPaymentPage({
  params,
}: WaitingPaymentPageProps) {
  const { slug, bookingId } = await params;

  let checkout;

  try {
    checkout = await getPublicCheckoutService().getCheckoutData(
      slug,
      bookingId,
    );
  } catch (error) {
    if (error instanceof PublicCheckoutNotFoundError) {
      notFound();
    }

    throw error;
  }

  if (checkout.hasPaidPayment) {
    redirect(
      `/gor/${checkout.venueSlug}/checkout/${checkout.bookingId}/success`,
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader
        gorSlug={checkout.venueSlug}
        gorName={checkout.venueName}
      />
      <main className={customerLayout.page}>
        <div
          className={`${customerLayout.container} ${customerLayout.funnelStack}`}
        >
          <CustomerFunnelHeader
            eyebrow={CUSTOMER_COPY.checkout.eyebrow}
            title={CUSTOMER_COPY.checkout.waitingTitle}
            description={CUSTOMER_COPY.checkout.waitingDescription}
          />

          <CheckoutPaymentWaitingPoller
            gorSlug={slug}
            bookingId={bookingId}
            initialCheckout={checkout}
          />
        </div>
      </main>
    </div>
  );
}
