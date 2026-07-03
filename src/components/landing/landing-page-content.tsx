"use client";

import { useState } from "react";

import { CtaSection } from "@/components/landing/cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingSearchSection } from "@/components/landing/landing-search-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { VenueDiscoverySection } from "@/components/landing/venue-discovery-section";
import { WhyChooseUsSection } from "@/components/landing/why-choose-us-section";
import { landingLayout } from "@/lib/layout-system";
import type { PublicVenueListItem } from "@/domains/venue/types";

type LandingPageContentProps = {
  venues: PublicVenueListItem[];
};

export function LandingPageContent({ venues }: LandingPageContentProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="bg-background min-h-screen">
      <LandingHeader />
      <main className="flex flex-col">
        <HeroSection />
        <LandingSearchSection query={query} onQueryChange={setQuery} />
        <div className={landingLayout.sectionDivider}>
          <WhyChooseUsSection />
        </div>
        <div className={landingLayout.sectionDivider}>
          <VenueDiscoverySection
            venues={venues}
            query={query}
            onQueryChange={setQuery}
          />
        </div>
        <div className={landingLayout.sectionDivider}>
          <HowItWorksSection />
        </div>
        <div className={landingLayout.sectionDivider}>
          <TestimonialsSection />
        </div>
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
