import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { landingContent } from "@/config/landing";

export function HeroSection() {
  const { hero } = landingContent;

  return (
    <section
      id="cari-lapangan"
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
    >
      <div className="from-primary/10 via-background to-background absolute inset-0 -z-10 bg-gradient-to-b" />
      <div className="bg-primary/20 absolute top-0 right-0 -z-10 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">
            {hero.eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base text-pretty sm:text-lg">
            {hero.description}
          </p>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <div className="bg-card ring-foreground/10 flex flex-col gap-3 rounded-2xl p-3 shadow-sm ring-1 sm:flex-row sm:items-center sm:p-2">
            <Input
              type="search"
              placeholder={hero.searchPlaceholder}
              aria-label="Cari lapangan"
              className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
              readOnly
            />
            <Button type="button" size="lg" className="h-11 w-full sm:w-auto">
              <Search />
              {hero.searchButton}
            </Button>
          </div>
          <p className="text-muted-foreground mt-3 text-center text-xs sm:text-sm">
            Fitur pencarian lapangan akan segera tersedia.
          </p>
        </div>
      </div>
    </section>
  );
}
