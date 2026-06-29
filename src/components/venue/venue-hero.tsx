import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PublicVenueData } from "@/domains/venue/types";

type VenueHeroProps = {
  venue: PublicVenueData;
};

export function VenueHero({ venue }: VenueHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
      <div className="from-primary/10 via-background to-background absolute inset-0 -z-10 bg-gradient-to-b" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-4">
          <Badge variant="secondary">Venue Olahraga</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {venue.name}
          </h1>
          <p className="text-muted-foreground inline-flex items-start gap-2 text-base sm:text-lg">
            <MapPin className="mt-1 size-4 shrink-0" />
            <span>{venue.address || "Alamat belum tersedia"}</span>
          </p>
        </div>

        {venue.description ? (
          <p className="text-muted-foreground max-w-3xl text-base leading-relaxed text-pretty sm:text-lg">
            {venue.description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
