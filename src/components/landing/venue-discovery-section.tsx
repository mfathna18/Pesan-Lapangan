"use client";

import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { useMemo } from "react";

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
import { SectionHeader } from "@/components/ui/section-header";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { landingContent } from "@/config/landing";
import type { PublicVenueListItem } from "@/domains/venue/types";
import { layout } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type VenueDiscoverySectionProps = {
  venues: PublicVenueListItem[];
  query: string;
  onQueryChange: (value: string) => void;
};

export function VenueDiscoverySection({
  venues,
  query,
  onQueryChange,
}: VenueDiscoverySectionProps) {
  const { popularVenues } = landingContent;

  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return venues;
    }

    return venues.filter((venue) =>
      venue.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query, venues]);

  return (
    <section id="venue-populer" className={`${layout.section} scroll-mt-20`}>
      <div className={`${layout.container} flex flex-col gap-12`}>
        <SectionHeader
          eyebrow={popularVenues.eyebrow}
          title={popularVenues.title}
          description={popularVenues.description}
        />

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
                onClick={() => onQueryChange("")}
              >
                {CUSTOMER_COPY.discovery.clearSearch}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <Card
                key={venue.id}
                className="group flex flex-col overflow-hidden transition-shadow duration-150 hover:shadow-[var(--shadow-elevated)] motion-reduce:transition-none"
              >
                <div className="bg-muted relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden">
                  {venue.coverImageUrl ? (
                    <div
                      className="size-full bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                      style={{ backgroundImage: `url(${venue.coverImageUrl})` }}
                      role="img"
                      aria-label={venue.name}
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
                      <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
