import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Clock } from "lucide-react";
import { customerLayout } from "@/lib/customer-layout";
import type { PublicVenueOpenHours } from "@/domains/venue/types";

type VenueOpenHoursSectionProps = {
  openHours: PublicVenueOpenHours[];
};

export function VenueOpenHoursSection({
  openHours,
}: VenueOpenHoursSectionProps) {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-12">
      <div className={customerLayout.containerWide}>
        <Card>
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-xl">Jam Operasional</CardTitle>
            <CardDescription>
              Ringkasan jam buka berdasarkan lapangan aktif di venue ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-border overflow-hidden rounded-[var(--radius-card)] border">
              {openHours.map((schedule) => (
                <div
                  key={schedule.dayOfWeek}
                  className="hover:bg-muted/40 flex items-center justify-between gap-4 px-4 py-2 transition-colors motion-reduce:transition-none"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <CalendarDays
                      className="text-muted-foreground size-4 shrink-0"
                      aria-hidden
                    />
                    <span className="truncate text-base leading-tight font-semibold">
                      {schedule.dayLabel}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Clock className="text-success size-4" aria-hidden />
                    <span className="text-success text-base leading-tight font-semibold">
                      {schedule.hours}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
