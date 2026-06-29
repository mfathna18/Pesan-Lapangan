import type { AnalyticsTopCourtRow } from "@/domains/booking/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";

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
  courts: AnalyticsTopCourtRow[];
};

export function AnalyticsTopCourtsTable({
  courts,
}: AnalyticsTopCourtsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Most Booked Courts</CardTitle>
        <CardDescription>
          Ranked by total bookings in the current period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Court</TableHead>
              <TableHead>Total Bookings</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Occupancy %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No court booking data available.
                </TableCell>
              </TableRow>
            ) : (
              courts.map((court) => (
                <TableRow key={court.courtId}>
                  <TableCell className="font-medium">
                    {court.courtName}
                  </TableCell>
                  <TableCell>{court.totalBookings}</TableCell>
                  <TableCell>{formatCurrency(court.revenue)}</TableCell>
                  <TableCell>{court.occupancyPercent}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
