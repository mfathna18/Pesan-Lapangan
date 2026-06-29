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
            Lapangan Tersedia
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Daftar lapangan aktif yang siap dipesan.
          </p>
        </div>

        {courts.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground pt-6 text-sm">
              Belum ada lapangan aktif di venue ini.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <Card key={court.id}>
                <CardHeader>
                  <CardTitle>{court.name}</CardTitle>
                  <CardDescription>{court.sportLabel}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
