import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { CourtDetailPage } from "@/components/court/court-detail-page";
import { siteConfig } from "@/config/site";
import { getCourtService } from "@/domains/booking/actions/get-court-service";
import { CourtNotFoundError } from "@/domains/booking/errors";

type CourtDetailRoutePageProps = {
  params: Promise<{
    slug: string;
    courtId: string;
  }>;
};

const getCachedPublicCourtDetail = cache(
  async (gorSlug: string, courtId: string) => {
    try {
      return await getCourtService().getPublicCourtDetail(gorSlug, courtId);
    } catch (error) {
      if (error instanceof CourtNotFoundError) {
        notFound();
      }

      throw error;
    }
  },
);

function buildCourtDescription(court: {
  name: string;
  sportLabel: string;
  gor: { name: string };
  description: string | null;
}) {
  return (
    court.description ??
    `${court.name} — ${court.sportLabel} di ${court.gor.name}. Lihat jam operasional, fasilitas, dan harga sebelum memilih waktu booking.`
  );
}

export async function generateMetadata({
  params,
}: CourtDetailRoutePageProps): Promise<Metadata> {
  const { slug, courtId } = await params;

  try {
    const court = await getCachedPublicCourtDetail(slug, courtId);
    const description = buildCourtDescription(court);
    const pageUrl = `${siteConfig.url}/gor/${court.gor.slug}/court/${court.id}`;
    const title = `${court.name} | ${court.gor.name}`;

    return {
      title,
      description,
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: siteConfig.name,
        locale: "id_ID",
        type: "website",
        ...(court.imageUrls[0]
          ? {
              images: [
                {
                  url: court.imageUrls[0],
                  alt: court.name,
                },
              ],
            }
          : {}),
      },
      twitter: {
        card: court.imageUrls[0] ? "summary_large_image" : "summary",
        title,
        description,
        ...(court.imageUrls[0] ? { images: [court.imageUrls[0]] } : {}),
      },
    };
  } catch {
    return {
      title: "Lapangan Tidak Ditemukan",
    };
  }
}

export default async function GorCourtDetailPage({
  params,
}: CourtDetailRoutePageProps) {
  const { slug, courtId } = await params;
  const court = await getCachedPublicCourtDetail(slug, courtId);

  return <CourtDetailPage court={court} />;
}
