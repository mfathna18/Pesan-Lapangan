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
import type { PublicVenueOpenHours } from "@/domains/venue/types";

type VenueOpenHoursSectionProps = {
  openHours: PublicVenueOpenHours[];
};

export function VenueOpenHoursSection({
  openHours,
}: VenueOpenHoursSectionProps) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Jam Operasional</CardTitle>
            <CardDescription>
              Ringkasan jam buka berdasarkan lapangan aktif.
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
