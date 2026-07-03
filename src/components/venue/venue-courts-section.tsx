import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { customerLayout } from "@/lib/customer-layout";
import { cn } from "@/lib/utils";
import type { PublicVenueCourt } from "@/domains/venue/types";

type VenueCourtsSectionProps = {
  gorSlug: string;
  courts: PublicVenueCourt[];
};

export function VenueCourtsSection({
  gorSlug,
  courts,
}: VenueCourtsSectionProps) {
  return (
    <section
      id="daftar-lapangan"
      className="bg-muted/30 scroll-mt-20 px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className={`${customerLayout.containerWide} space-y-8`}>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Daftar Lapangan
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base">
            Pilih lapangan yang ingin Anda booking. Setiap lapangan menampilkan
            jenis olahraga dan status ketersediaannya.
          </p>
        </div>

        {courts.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={CUSTOMER_COPY.venue.noCourtsTitle}
            description={CUSTOMER_COPY.venue.noCourtsDescription}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courts.map((court) => (
              <Card
                key={court.id}
                className={cn("flex flex-col", !court.isActive && "opacity-80")}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-xl">{court.name}</CardTitle>
                    <Badge variant={court.isActive ? "confirmed" : "expired"}>
                      {court.isActive
                        ? CUSTOMER_COPY.venue.courtAvailable
                        : CUSTOMER_COPY.venue.courtUnavailable}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {court.sportLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3 pt-0">
                  {court.isActive ? (
                    <>
                      <Link
                        href={`/gor/${gorSlug}/court/${court.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "w-full",
                        )}
                      >
                        Lihat Detail
                      </Link>
                      <Link
                        href={`/gor/${gorSlug}/court/${court.id}/booking`}
                        className={cn(buttonVariants({ size: "lg" }), "w-full")}
                      >
                        <CalendarDays className="size-4" />
                        {CUSTOMER_COPY.venue.bookCta}
                      </Link>
                    </>
                  ) : (
                    <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-4 text-center text-sm">
                      {CUSTOMER_COPY.venue.courtInactiveNote}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
