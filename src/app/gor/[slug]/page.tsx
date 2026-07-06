import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { VenuePage } from "@/components/venue/venue-page";
import { siteConfig } from "@/config/site";
import { getVenueService } from "@/domains/venue/actions/get-venue-service";
import { getPrimaryCoverImage } from "@/domains/media/utils/cover-images";
import { VenueNotFoundError } from "@/domains/venue/errors";

type VenueRoutePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getCachedPublicVenue = cache(async (slug: string) => {
  try {
    return await getVenueService().getPublicVenueBySlug(slug);
  } catch (error) {
    if (error instanceof VenueNotFoundError) {
      notFound();
    }

    throw error;
  }
});

export const dynamic = "force-dynamic";

function buildVenueDescription(venue: {
  name: string;
  description: string | null;
}) {
  return (
    venue.description ??
    `Pesan lapangan di ${venue.name}. Lihat olahraga tersedia, lapangan, dan jam operasional.`
  );
}

export async function generateMetadata({
  params,
}: VenueRoutePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const venue = await getCachedPublicVenue(slug);
    const description = buildVenueDescription(venue);
    const pageUrl = `${siteConfig.url}/gor/${venue.slug}`;
    const primaryCover = getPrimaryCoverImage(venue.coverImages);

    return {
      title: venue.name,
      description,
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        title: venue.name,
        description,
        url: pageUrl,
        siteName: siteConfig.name,
        locale: "id_ID",
        type: "website",
        ...(primaryCover
          ? {
              images: [
                {
                  url: primaryCover,
                  alt: `${venue.name} cover`,
                },
              ],
            }
          : {}),
      },
      twitter: {
        card: primaryCover ? "summary_large_image" : "summary",
        title: venue.name,
        description,
        ...(primaryCover ? { images: [primaryCover] } : {}),
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
  const venue = await getCachedPublicVenue(slug);

  return <VenuePage venue={venue} />;
}
