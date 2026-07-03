import { OwnerBookingDisplayStatusBadge } from "@/components/booking/booking-status-badges";
import type { OwnerAnalyticsRecentBookingRow } from "@/domains/analytics/analytics-types";
import {
  formatBookingDate,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";

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

type OwnerRecentBookingsTableProps = {
  bookings: OwnerAnalyticsRecentBookingRow[];
  title?: string;
  description?: string;
};

export function OwnerRecentBookingsTable({
  bookings,
  title = "Booking Terbaru",
  description = "10 booking terakhir di venue Anda",
}: OwnerRecentBookingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor Booking</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Lapangan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jam</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  Belum ada booking terbaru. Booking pertama akan muncul di
                  sini.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.bookingNumber}
                  </TableCell>
                  <TableCell>{booking.customerName}</TableCell>
                  <TableCell>{booking.courtName}</TableCell>
                  <TableCell>
                    {formatBookingDate(booking.bookingDate)}
                  </TableCell>
                  <TableCell>
                    {formatTimeRange(booking.startMinute, booking.endMinute)}
                  </TableCell>
                  <TableCell>
                    <OwnerBookingDisplayStatusBadge
                      bookingStatus={booking.bookingStatus}
                      paymentStatus={booking.paymentStatus}
                    />
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
