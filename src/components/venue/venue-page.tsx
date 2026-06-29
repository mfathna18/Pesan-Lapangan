import { VenueCourtsSection } from "@/components/venue/venue-courts-section";
import { VenueHeader } from "@/components/venue/venue-header";
import { VenueHero } from "@/components/venue/venue-hero";
import { VenueOpenHoursSection } from "@/components/venue/venue-open-hours-section";
import { VenueSportsSection } from "@/components/venue/venue-sports-section";
import type { PublicVenueData } from "@/domains/venue/types";

type VenuePageProps = {
  venue: PublicVenueData;
};

export function VenuePage({ venue }: VenuePageProps) {
  return (
    <div className="bg-background min-h-screen">
      <VenueHeader />
      <main>
        <VenueHero venue={venue} />
        <VenueOpenHoursSection openHours={venue.openHours} />
        <VenueSportsSection sports={venue.sports} />
        <VenueCourtsSection gorSlug={venue.slug} courts={venue.courts} />
      </main>
    </div>
  );
}
