import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VenuePage } from "@/components/venue/venue-page";
import { getVenueService } from "@/domains/venue/actions/get-venue-service";
import { VenueNotFoundError } from "@/domains/venue/errors";
import { siteConfig } from "@/config/site";

type VenueRoutePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getVenue(slug: string) {
  try {
    return await getVenueService().getPublicVenueBySlug(slug);
  } catch (error) {
    if (error instanceof VenueNotFoundError) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({
  params,
}: VenueRoutePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const venue = await getVenueService().getPublicVenueBySlug(slug);
    const description =
      venue.description ??
      `Pesan lapangan di ${venue.name}. Lihat olahraga tersedia, lapangan aktif, dan jam operasional.`;

    return {
      title: venue.name,
      description,
      alternates: {
        canonical: `${siteConfig.url}/gor/${venue.slug}`,
      },
      openGraph: {
        title: `${venue.name} | ${siteConfig.name}`,
        description,
        url: `${siteConfig.url}/gor/${venue.slug}`,
        siteName: siteConfig.name,
        locale: "id_ID",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${venue.name} | ${siteConfig.name}`,
        description,
      },
    };
  } catch {
    return {
      title: "Venue Tidak Ditemukan",
    };
  }
}

export default async function GorVenuePage({ params }: VenueRoutePageProps) {
  const { slug } = await params;
  const venue = await getVenue(slug);

  return <VenuePage venue={venue} />;
}
