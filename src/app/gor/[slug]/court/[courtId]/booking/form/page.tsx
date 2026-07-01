import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";

import { PublicBookingForm } from "@/components/court/public-booking-form";
import { getAvailabilityService } from "@/domains/availability/actions/get-availability-service";
import { publicBookingFormSearchParamsSchema } from "@/domains/booking/actions/schemas";
import { getCourtService } from "@/domains/booking/actions/get-court-service";
import { CourtNotFoundError } from "@/domains/booking/errors";
import {
  resolveRangeLineItems,
  resolveRangeTotalPrice,
} from "@/domains/booking/utils/booking-range";
import { siteConfig } from "@/config/site";

type PublicBookingFormPageProps = {
  params: Promise<{
    slug: string;
    courtId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
}: PublicBookingFormPageProps): Promise<Metadata> {
  const { slug, courtId } = await params;

  try {
    const court = await getCachedPublicCourtDetail(slug, courtId);
    const title = `Formulir Booking ${court.name} | ${court.gor.name}`;

    return {
      title,
      description: `Lengkapi data booking untuk ${court.name} di ${court.gor.name}.`,
      alternates: {
        canonical: `${siteConfig.url}/gor/${court.gor.slug}/court/${court.id}/booking/form`,
      },
    };
  } catch {
    return {
      title: "Formulir Booking",
    };
  }
}

export default async function PublicBookingFormPage({
  params,
  searchParams,
}: PublicBookingFormPageProps) {
  const { slug, courtId } = await params;
  const resolvedSearchParams = await searchParams;
  const parsedSearchParams = publicBookingFormSearchParamsSchema.safeParse({
    date: resolvedSearchParams.date,
    startMinute: resolvedSearchParams.startMinute,
    endMinute: resolvedSearchParams.endMinute,
    price: resolvedSearchParams.price,
  });

  if (!parsedSearchParams.success) {
    redirect(`/gor/${slug}/court/${courtId}/booking`);
  }

  const court = await getCachedPublicCourtDetail(slug, courtId);
  const { date, startMinute, endMinute } = parsedSearchParams.data;
  const bookingDate = new Date(`${date}T00:00:00`);

  const slots = await getAvailabilityService().getSlotGrid({
    courtId,
    date: bookingDate,
  });
  const resolvedPrice = resolveRangeTotalPrice(slots, startMinute, endMinute);
  const lineItems = resolveRangeLineItems(slots, startMinute, endMinute) ?? [];
  const slotUnavailable = resolvedPrice === null;

  return (
    <PublicBookingForm
      context={{
        gorSlug: court.gor.slug,
        gorName: court.gor.name,
        courtId: court.id,
        courtName: court.name,
        sportLabel: court.sportLabel,
        selection: {
          bookingDate: date,
          startMinute,
          endMinute,
          price: resolvedPrice ?? parsedSearchParams.data.price ?? 0,
          durationMinute: endMinute - startMinute,
          lineItems,
        },
        slotUnavailable,
      }}
    />
  );
}
