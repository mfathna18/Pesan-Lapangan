import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PublicVenueData } from "@/domains/venue/types";

type VenueHeroProps = {
  venue: PublicVenueData;
};

export function VenueHero({ venue }: VenueHeroProps) {
  const locationLine = [venue.address, venue.city].filter(Boolean).join(", ");

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-48 w-full sm:h-64 md:h-80">
        {venue.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.coverImageUrl}
            alt={`${venue.name} cover`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="from-primary/20 via-primary/10 to-muted absolute inset-0 bg-gradient-to-br" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
          {venue.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={venue.logoUrl}
              alt={`${venue.name} logo`}
              className="border-background bg-background size-24 rounded-2xl border-4 object-cover shadow-lg sm:size-28"
            />
          ) : (
            <div className="border-background bg-background text-primary flex size-24 items-center justify-center rounded-2xl border-4 text-3xl font-semibold shadow-lg sm:size-28">
              {venue.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-3 pb-2">
            <Badge
              variant="secondary"
              className="bg-background/90 text-foreground"
            >
              Venue Olahraga
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              {venue.name}
            </h1>
          </div>
        </div>

        <div className="space-y-4 py-8">
          {venue.description ? (
            <p className="text-muted-foreground max-w-3xl text-base leading-relaxed text-pretty sm:text-lg">
              {venue.description}
            </p>
          ) : null}

          <p className="text-muted-foreground inline-flex items-start gap-2 text-base sm:text-lg">
            <MapPin className="mt-1 size-4 shrink-0" />
            <span>{locationLine || "Alamat belum tersedia"}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
