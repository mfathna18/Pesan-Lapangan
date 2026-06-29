import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PublicCourtOpenHours } from "@/domains/booking/types";

type CourtOperatingHoursSectionProps = {
  openHours: PublicCourtOpenHours[];
};

export function CourtOperatingHoursSection({
  openHours,
}: CourtOperatingHoursSectionProps) {
  const hasOpenHours = openHours.some((schedule) => schedule.hours !== "Tutup");

  if (!hasOpenHours) {
    return null;
  }

  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Jam Operasional</CardTitle>
            <CardDescription>
              Jadwal buka lapangan berdasarkan konfigurasi venue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hari</TableHead>
                  <TableHead>Jam Buka</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openHours.map((schedule) => (
                  <TableRow key={schedule.dayOfWeek}>
                    <TableCell className="font-medium">
                      {schedule.dayLabel}
                    </TableCell>
                    <TableCell>{schedule.hours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
