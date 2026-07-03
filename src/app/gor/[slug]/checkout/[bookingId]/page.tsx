import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { PublicCheckout } from "@/components/checkout/public-checkout";
import { siteConfig } from "@/config/site";
import { loadPublicCheckoutData } from "@/domains/payment/actions/load-public-checkout";
import { PublicCheckoutNotFoundError } from "@/domains/payment/errors";

type PublicCheckoutPageProps = {
  params: Promise<{
    slug: string;
    bookingId: string;
  }>;
};

const getCachedCheckoutData = cache(
  async (gorSlug: string, bookingId: string) => {
    try {
      return await loadPublicCheckoutData(gorSlug, bookingId);
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
}: PublicCheckoutPageProps): Promise<Metadata> {
  const { slug, bookingId } = await params;

  try {
    const checkout = await getCachedCheckoutData(slug, bookingId);

    return {
      title: `Pembayaran ${checkout.bookingNumber}`,
      description: `Selesaikan pembayaran booking ${checkout.bookingNumber} di ${checkout.venueName}.`,
      alternates: {
        canonical: `${siteConfig.url}/gor/${slug}/checkout/${bookingId}`,
      },
    };
  } catch {
    return {
      title: "Pembayaran",
    };
  }
}

export default async function PublicCheckoutPage({
  params,
}: PublicCheckoutPageProps) {
  const { slug, bookingId } = await params;
  const checkout = await getCachedCheckoutData(slug, bookingId);

  return <PublicCheckout checkout={checkout} />;
}
