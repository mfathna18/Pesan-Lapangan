import { notFound, redirect } from "next/navigation";

import { CheckoutPaymentWaitingPoller } from "@/components/checkout/checkout-payment-waiting-poller";
import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { getPublicCheckoutService } from "@/domains/payment/actions/get-public-checkout-service";
import { PublicCheckoutNotFoundError } from "@/domains/payment/errors";

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
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              Menunggu Pembayaran
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Pembayaran Sedang Diproses
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Kami menunggu konfirmasi dari Midtrans. Halaman ini akan
              diperbarui otomatis setelah pembayaran berhasil.
            </p>
          </div>

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
