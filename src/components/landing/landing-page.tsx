import { CtaSection } from "@/components/landing/cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { SportsCategoriesSection } from "@/components/landing/sports-categories-section";
import { WhyChooseUsSection } from "@/components/landing/why-choose-us-section";

export function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <LandingHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <SportsCategoriesSection />
        <WhyChooseUsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
