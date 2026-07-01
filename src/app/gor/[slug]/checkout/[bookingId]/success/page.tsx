import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";

import { CheckoutSuccessPoller } from "@/components/checkout/checkout-success-poller";
import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { siteConfig } from "@/config/site";
import { getPublicCheckoutService } from "@/domains/payment/actions/get-public-checkout-service";
import { PublicCheckoutNotFoundError } from "@/domains/payment/errors";

type CheckoutSuccessPageProps = {
  params: Promise<{
    slug: string;
    bookingId: string;
  }>;
};

const getCachedCheckoutData = cache(
  async (gorSlug: string, bookingId: string) => {
    try {
      return await getPublicCheckoutService().getCheckoutData(
        gorSlug,
        bookingId,
      );
    } catch (error) {
      if (error instanceof PublicCheckoutNotFoundError) {
        notFound();
      }

      throw error;
    }
  },
);

export async function generateMetadata({
  params,
}: CheckoutSuccessPageProps): Promise<Metadata> {
  const { slug, bookingId } = await params;

  try {
    const checkout = await getCachedCheckoutData(slug, bookingId);

    return {
      title: `Pembayaran Berhasil · ${checkout.bookingNumber}`,
      description: `Booking ${checkout.bookingNumber} dikonfirmasi di ${checkout.venueName}.`,
      alternates: {
        canonical: `${siteConfig.url}/gor/${slug}/checkout/${bookingId}/success`,
      },
    };
  } catch {
    return {
      title: "Pembayaran Berhasil",
    };
  }
}

export default async function CheckoutSuccessPage({
  params,
}: CheckoutSuccessPageProps) {
  const { slug, bookingId } = await params;
  const checkout = await getCachedCheckoutData(slug, bookingId);

  if (!checkout.hasPaidPayment) {
    redirect(`/gor/${slug}/checkout/${bookingId}`);
  }

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader
        gorSlug={checkout.venueSlug}
        gorName={checkout.venueName}
      />
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <CheckoutSuccessPoller
            gorSlug={slug}
            bookingId={bookingId}
            initialCheckout={checkout}
          />
        </div>
      </main>
    </div>
  );
}
