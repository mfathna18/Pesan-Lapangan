import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <section className="bg-muted/40 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Daftar Lapangan
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Semua lapangan di venue ini beserta status ketersediaannya.
          </p>
        </div>

        {courts.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground pt-6 text-sm">
              Belum ada lapangan di venue ini.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courts.map((court) => (
              <Card
                key={court.id}
                className={cn("flex flex-col", !court.isActive && "opacity-75")}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{court.name}</CardTitle>
                    <Badge variant={court.isActive ? "confirmed" : "expired"}>
                      {court.isActive ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </div>
                  <CardDescription>{court.sportLabel}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  {court.isActive ? (
                    <Link
                      href={`/gor/${gorSlug}/court/${court.id}/booking`}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full",
                      )}
                    >
                      <CalendarDays className="size-4" />
                      Booking Sekarang
                    </Link>
                  ) : (
                    <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-3 text-center text-sm">
                      Lapangan ini tidak tersedia untuk booking.
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
