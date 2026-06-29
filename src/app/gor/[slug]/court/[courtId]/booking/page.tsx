import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { CourtAvailabilityBooking } from "@/components/court/court-availability-booking";
import { siteConfig } from "@/config/site";
import { getCourtService } from "@/domains/booking/actions/get-court-service";
import { CourtNotFoundError } from "@/domains/booking/errors";

type CourtBookingRoutePageProps = {
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

export async function generateMetadata({
  params,
}: CourtBookingRoutePageProps): Promise<Metadata> {
  const { slug, courtId } = await params;

  try {
    const court = await getCachedPublicCourtDetail(slug, courtId);
    const description = `Pilih tanggal dan waktu booking untuk ${court.name} di ${court.gor.name}.`;
    const pageUrl = `${siteConfig.url}/gor/${court.gor.slug}/court/${court.id}/booking`;
    const title = `Booking ${court.name} | ${court.gor.name}`;

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
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Booking Tidak Tersedia",
    };
  }
}

export default async function CourtAvailabilityBookingPage({
  params,
}: CourtBookingRoutePageProps) {
  const { slug, courtId } = await params;
  const court = await getCachedPublicCourtDetail(slug, courtId);

  return (
    <CourtAvailabilityBooking
      court={{
        gorSlug: court.gor.slug,
        gorName: court.gor.name,
        courtId: court.id,
        courtName: court.name,
        sportLabel: court.sportLabel,
      }}
    />
  );
}
