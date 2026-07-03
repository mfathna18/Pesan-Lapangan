import { CourtBookingCta } from "@/components/court/court-booking-cta";
import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { CourtFacilitiesSection } from "@/components/court/court-facilities-section";
import { CourtImagesSection } from "@/components/court/court-images-section";
import { CourtOperatingHoursSection } from "@/components/court/court-operating-hours-section";
import { CourtPriceSection } from "@/components/court/court-price-section";
import { CourtSummaryCard } from "@/components/customer/court-summary-card";
import type { PublicCourtDetailData } from "@/domains/booking/types";

type CourtDetailPageProps = {
  court: PublicCourtDetailData;
};

export function CourtDetailPage({ court }: CourtDetailPageProps) {
  const bookingHref = `/gor/${court.gor.slug}/court/${court.id}/booking`;

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader gorSlug={court.gor.slug} gorName={court.gor.name} />
      <main className="space-y-10 pb-4 sm:space-y-12">
        <CourtImagesSection
          courtName={court.name}
          sportLabel={court.sportLabel}
          imageUrls={court.imageUrls}
        />

        <CourtSummaryCard court={court} bookingHref={bookingHref} />

        {court.startingPrice != null ? (
          <CourtPriceSection startingPrice={court.startingPrice} />
        ) : null}

        <CourtOperatingHoursSection openHours={court.openHours} />
        <CourtFacilitiesSection facilities={court.facilities} />
        <CourtBookingCta bookingHref={bookingHref} />
      </main>
    </div>
  );
}
