import type { OwnerAnalyticsTopCourtRow } from "@/domains/analytics/types";

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

type AnalyticsTopCourtsTableProps = {
  courts: OwnerAnalyticsTopCourtRow[];
};

export function AnalyticsTopCourtsTable({
  courts,
}: AnalyticsTopCourtsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lapangan Terlaris</CardTitle>
        <CardDescription>
          Lapangan dengan booking terbanyak bulan ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Lapangan</TableHead>
              <TableHead className="text-right">Total Booking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Belum ada data booking lapangan bulan ini.
                </TableCell>
              </TableRow>
            ) : (
              courts.map((court, index) => (
                <TableRow key={court.courtId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {court.courtName}
                  </TableCell>
                  <TableCell className="text-right">
                    {court.totalBookings.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
