import { Dumbbell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { customerLayout } from "@/lib/customer-layout";
import type { PublicVenueData } from "@/domains/venue/types";

type VenueSportsSectionProps = {
  sports: PublicVenueData["sports"];
};

export function VenueSportsSection({ sports }: VenueSportsSectionProps) {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-14">
      <div className={customerLayout.containerWide}>
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Olahraga Tersedia</CardTitle>
            <CardDescription>
              Jenis olahraga yang bisa Anda pesan di venue ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sports.length === 0 ? (
              <EmptyState
                variant="plain"
                icon={Dumbbell}
                title={CUSTOMER_COPY.venue.noSportsTitle}
                description={CUSTOMER_COPY.venue.noSportsDescription}
              />
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {sports.map((sport) => (
                  <Badge
                    key={sport.type}
                    variant="outline"
                    className="px-3 py-1 text-sm"
                  >
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
