"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { landingContent } from "@/config/landing";
import { layout } from "@/lib/design-system";

type LandingSearchSectionProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function LandingSearchSection({
  query,
  onQueryChange,
}: LandingSearchSectionProps) {
  const { hero } = landingContent;

  return (
    <section
      id="cari-lapangan"
      className={`${layout.sectionCompact} scroll-mt-20 pt-0`}
    >
      <div className={`${layout.container} flex flex-col gap-10`}>
        <SectionHeader
          eyebrow="Cari & Pesan"
          title="Temukan Lapangan Terdekat"
          description="Ketik nama gor, kota, atau jenis olahraga untuk mulai booking."
        />

        <div className="mx-auto w-full max-w-3xl">
          <div className="surface-elevated flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-2 sm:p-2">
            <div className="relative flex flex-1 items-center">
              <Search
                className="text-muted-foreground pointer-events-none absolute left-3 size-4"
                aria-hidden
              />
              <Input
                type="search"
                placeholder={hero.searchPlaceholder}
                aria-label="Cari lapangan olahraga"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                className="h-12 border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="button" size="lg" className="h-12 w-full sm:w-auto">
              {hero.searchButton}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
