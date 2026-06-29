import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublicVenueCourt } from "@/domains/venue/types";

type VenueCourtsSectionProps = {
  courts: PublicVenueCourt[];
};

export function VenueCourtsSection({ courts }: VenueCourtsSectionProps) {
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
              <Card key={court.id} className="flex flex-col">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{court.name}</CardTitle>
                    <Badge variant={court.isActive ? "confirmed" : "cancelled"}>
                      {court.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <CardDescription>{court.sportLabel}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled
                    aria-disabled="true"
                  >
                    <CalendarDays className="size-4" />
                    Lihat Jadwal
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
