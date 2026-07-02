import { LandingPageContent } from "@/components/landing/landing-page-content";
import type { PublicVenueListItem } from "@/domains/venue/types";

type LandingPageProps = {
  venues: PublicVenueListItem[];
};

export function LandingPage({ venues }: LandingPageProps) {
  return <LandingPageContent venues={venues} />;
}
