import { CourtBookingCta } from "@/components/court/court-booking-cta";
import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { CourtFacilitiesSection } from "@/components/court/court-facilities-section";
import { CourtImagesSection } from "@/components/court/court-images-section";
import { CourtOperatingHoursSection } from "@/components/court/court-operating-hours-section";
import { CourtPriceSection } from "@/components/court/court-price-section";
import type { PublicCourtDetailData } from "@/domains/booking/types";

type CourtDetailPageProps = {
  court: PublicCourtDetailData;
};

export function CourtDetailPage({ court }: CourtDetailPageProps) {
  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader gorSlug={court.gor.slug} gorName={court.gor.name} />
      <main>
        <section className="px-4 pt-8 sm:px-6">
          <div className="mx-auto max-w-6xl space-y-4">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              Detail Lapangan
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {court.name}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {court.sportLabel}
            </p>
            {court.description ? (
              <p className="text-muted-foreground max-w-3xl text-base leading-relaxed text-pretty sm:text-lg">
                {court.description}
              </p>
            ) : null}
          </div>
        </section>

        <CourtImagesSection
          courtName={court.name}
          sportLabel={court.sportLabel}
          imageUrls={court.imageUrls}
        />

        {court.startingPrice != null ? (
          <CourtPriceSection startingPrice={court.startingPrice} />
        ) : null}

        <CourtOperatingHoursSection openHours={court.openHours} />
        <CourtFacilitiesSection facilities={court.facilities} />
        <CourtBookingCta />
      </main>
    </div>
  );
}
