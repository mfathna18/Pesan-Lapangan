import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { getPrimaryCoverImage } from "@/domains/media/utils/cover-images";
import type { PublicVenueData } from "@/domains/venue/types";
import { customerLayout } from "@/lib/customer-layout";
import { cn } from "@/lib/utils";

type VenueHeroProps = {
  venue: PublicVenueData;
};

function getTodayHoursLabel(
  openHours: PublicVenueData["openHours"],
): string | null {
  const today = new Date().getDay();
  const schedule = openHours.find((item) => item.dayOfWeek === today);

  return schedule?.hours ?? null;
}

export function VenueHero({ venue }: VenueHeroProps) {
  const locationLine = [venue.address, venue.city].filter(Boolean).join(", ");
  const todayHours = getTodayHoursLabel(venue.openHours);
  const primaryCover = getPrimaryCoverImage(venue.coverImages);

  return (
    <section className="relative overflow-hidden">
      <div className={cn("relative w-full", customerLayout.heroHeight)}>
        {primaryCover ? (
          <Image
            src={primaryCover}
            alt={`Foto ${venue.name}`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="from-muted to-muted/70 absolute inset-0 bg-gradient-to-br" />
        )}
        <div className={customerLayout.heroOverlay} aria-hidden />
        <div className={customerLayout.heroGradient} aria-hidden />

        <div
          className={cn(
            customerLayout.containerWide,
            "absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6 sm:pb-8",
          )}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
            {venue.logoUrl ? (
              <div className="border-background/90 bg-background relative size-24 shrink-0 overflow-hidden rounded-2xl border-4 shadow-[var(--shadow-md)] sm:size-28">
                <Image
                  src={venue.logoUrl}
                  alt={`Logo ${venue.name}`}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
            ) : (
              <div className="border-background/90 bg-background text-primary flex size-24 shrink-0 items-center justify-center rounded-2xl border-4 text-3xl font-semibold shadow-[var(--shadow-md)] sm:size-28">
                {venue.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 space-y-3 pb-1">
              <Badge className="border-white/20 bg-white/15 text-white backdrop-blur-sm hover:bg-white/15">
                {CUSTOMER_COPY.venue.badge}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-balance text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl">
                {venue.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className={`${customerLayout.containerWide} relative px-4 sm:px-6`}>
        <div className="space-y-7 py-8 sm:py-10">
          {venue.description ? (
            <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed text-pretty sm:text-xl">
              {venue.description}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
            <p className="text-muted-foreground inline-flex items-center gap-2.5 text-base leading-snug sm:text-lg">
              <MapPin className="text-primary size-4 shrink-0" aria-hidden />
              <span>{locationLine || CUSTOMER_COPY.venue.addressFallback}</span>
            </p>

            {todayHours ? (
              <p className="text-muted-foreground inline-flex items-center gap-2.5 text-base leading-snug sm:text-lg">
                <Clock className="text-primary size-4 shrink-0" aria-hidden />
                <span>Hari ini: {todayHours}</span>
              </p>
            ) : null}
          </div>

          {venue.sports.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {venue.sports.map((sport) => (
                <Badge
                  key={sport.type}
                  variant="outline"
                  className="px-3 py-1 text-sm"
                >
                  {sport.label}
                </Badge>
              ))}
            </div>
          ) : null}

          <Link
            href="#daftar-lapangan"
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex w-full items-center gap-2 sm:w-auto",
            )}
          >
            <CalendarDays className="size-4" aria-hidden />
            {CUSTOMER_COPY.venue.bookCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
