import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublicVenueData } from "@/domains/venue/types";

type VenueSportsSectionProps = {
  sports: PublicVenueData["sports"];
};

export function VenueSportsSection({ sports }: VenueSportsSectionProps) {
  return (
    <section className="px-4 pb-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Olahraga Tersedia</CardTitle>
            <CardDescription>
              Jenis olahraga yang bisa kamu pesan di venue ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sports.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Belum ada kategori olahraga aktif.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sports.map((sport) => (
                  <Badge key={sport.type} variant="outline">
                    {sport.label}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
