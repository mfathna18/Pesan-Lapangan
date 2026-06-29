import {
  Car,
  Coffee,
  Droplets,
  MoreHorizontal,
  Shirt,
  Toilet,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CourtFacilityItem = {
  type: string;
  label: string;
};

type CourtFacilitiesSectionProps = {
  facilities: CourtFacilityItem[];
};

const FACILITY_ICONS: Record<string, LucideIcon> = {
  PARKING: Car,
  TOILET: Toilet,
  SHOWER: Droplets,
  CHANGING_ROOM: Shirt,
  CAFETERIA: Coffee,
  PRAYER_ROOM: MoreHorizontal,
  OTHER: MoreHorizontal,
};

export function CourtFacilitiesSection({
  facilities,
}: CourtFacilitiesSectionProps) {
  if (facilities.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/40 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Fasilitas Tersedia</CardTitle>
            <CardDescription>
              Fasilitas pendukung yang tersedia di lapangan ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {facilities.map((facility) => {
                const Icon = FACILITY_ICONS[facility.type] ?? MoreHorizontal;

                return (
                  <Badge
                    key={facility.type}
                    variant="outline"
                    className="gap-1.5 px-3 py-1.5 text-sm"
                  >
                    <Icon className="size-3.5" />
                    {facility.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
