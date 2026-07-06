"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { landingContent } from "@/config/landing";
import type { PublicVenueListItem } from "@/domains/venue/types";
import { getPrimaryCoverImage } from "@/domains/media/utils/cover-images";
import { layout } from "@/lib/design-system";
import { landingLayout } from "@/lib/layout-system";
import { cn } from "@/lib/utils";

type LandingVenueSearchSectionProps = {
  venues: PublicVenueListItem[];
};

export function LandingVenueSearchSection({
  venues,
}: LandingVenueSearchSectionProps) {
  const { hero } = landingContent;
  const [query, setQuery] = useState("");

  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return venues;
    }

    return venues.filter((venue) => {
      const haystack = [venue.name, venue.city, venue.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [query, venues]);

  const hasQuery = query.trim().length > 0;

  return (
    <section
      id="cari-lapangan"
      className={`scroll-mt-20 px-4 pt-0 pb-16 sm:px-6 sm:pb-20`}
    >
      <div className={`${layout.container} flex flex-col gap-6`}>
        <SectionHeader
          eyebrow="Cari & Pesan"
          title="Temukan Lapangan Terdekat"
          description="Ketik nama gor, kota, atau jenis olahraga untuk mulai booking."
        />

        <div className="mx-auto w-full max-w-3xl">
          <div
            className={`${landingLayout.searchCard} flex flex-col gap-3 sm:flex-row sm:items-center`}
          >
            <div className="relative flex flex-1 items-center">
              <Search
                className="text-muted-foreground pointer-events-none absolute left-4 size-4"
                aria-hidden
              />
              <Input
                type="search"
                placeholder={hero.searchPlaceholder}
                aria-label="Cari lapangan olahraga"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 border-0 bg-transparent pl-11 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="button" size="lg" className="h-12 w-full sm:w-auto">
              {hero.searchButton}
            </Button>
          </div>
        </div>

        <div id="venue-populer" className="scroll-mt-20 space-y-6">
          {hasQuery ? (
            <p className="text-muted-foreground text-center text-sm">
              {filteredVenues.length > 0
                ? `Menampilkan ${filteredVenues.length} venue untuk “${query.trim()}”.`
                : `Tidak ada venue yang cocok dengan “${query.trim()}”.`}
            </p>
          ) : null}

          {venues.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title={CUSTOMER_COPY.discovery.noVenuesTitle}
              description={CUSTOMER_COPY.discovery.noVenuesDescription}
            />
          ) : filteredVenues.length === 0 ? (
            <EmptyState
              icon={Search}
              title={CUSTOMER_COPY.discovery.noSearchTitle}
              description={CUSTOMER_COPY.discovery.noSearchDescription(
                query.trim(),
              )}
              action={
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setQuery("")}
                >
                  {CUSTOMER_COPY.discovery.clearSearch}
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVenues.map((venue, index) => {
                const coverImage = getPrimaryCoverImage(venue.coverImages);

                return (
                  <Card
                    key={venue.id}
                    className="group flex flex-col overflow-hidden transition-shadow duration-150 hover:shadow-[var(--shadow-elevated)] motion-reduce:transition-none"
                  >
                    <div className="bg-muted relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={venue.name}
                          fill
                          priority={index < 3}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                        />
                      ) : (
                        <span className="text-muted-foreground px-4 text-center text-sm">
                          {venue.name}
                        </span>
                      )}
                    </div>
                    <CardHeader className="gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-lg leading-snug">
                          {venue.name}
                        </CardTitle>
                        <Badge variant="success" className="shrink-0">
                          {venue.city}
                        </Badge>
                      </div>
                      {venue.address ? (
                        <CardDescription className="flex items-start gap-1.5">
                          <MapPin
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden
                          />
                          <span>{venue.address}</span>
                        </CardDescription>
                      ) : null}
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                      {venue.description ? (
                        <p className="text-muted-foreground mb-5 line-clamp-2 text-sm leading-relaxed">
                          {venue.description}
                        </p>
                      ) : null}
                      <Link
                        href={`/gor/${venue.slug}`}
                        className={cn(buttonVariants({ size: "lg" }), "w-full")}
                      >
                        {CUSTOMER_COPY.discovery.viewVenue}
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
