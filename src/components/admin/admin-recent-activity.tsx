import type {
  AdminRecentBooking,
  AdminRecentPayment,
  AdminRecentRegistration,
  AdminRecentSubscription,
} from "@/domains/admin/types";
import { BookingStatusBadge } from "@/components/booking/booking-status-badges";
import { PaymentRecordStatusBadge } from "@/components/revenue/payment-record-status-badge";
import { Badge } from "@/components/ui/badge";
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

type AdminRecentActivityProps = {
  bookings: AdminRecentBooking[];
  registrations: AdminRecentRegistration[];
  subscriptions: AdminRecentSubscription[];
  payments: AdminRecentPayment[];
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function subscriptionStatusVariant(
  status: AdminRecentSubscription["status"],
): "confirmed" | "pending" | "cancelled" | "expired" {
  switch (status) {
    case "ACTIVE":
    case "TRIAL":
      return "confirmed";
    case "GRACE_PERIOD":
      return "pending";
    case "EXPIRED":
      return "expired";
    default:
      return "cancelled";
  }
}

export function AdminRecentActivity({
  bookings,
  registrations,
  subscriptions,
  payments,
}: AdminRecentActivityProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Latest Bookings</CardTitle>
          <CardDescription>10 booking terbaru di platform</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground py-8 text-center text-sm"
                  >
                    Belum ada booking.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.bookingNumber}
                    </TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>{booking.gorName}</TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Registrations</CardTitle>
          <CardDescription>Pemilik venue terbaru</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>GOR</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground py-8 text-center text-sm"
                  >
                    Belum ada registrasi.
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.ownerName}
                    </TableCell>
                    <TableCell>{registration.email}</TableCell>
                    <TableCell>{registration.gorName ?? "—"}</TableCell>
                    <TableCell>
                      {formatDateTime(registration.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Subscriptions</CardTitle>
          <CardDescription>Perubahan langganan terbaru</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground py-8 text-center text-sm"
                  >
                    Belum ada langganan.
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      {subscription.ownerName}
                    </TableCell>
                    <TableCell>{subscription.plan}</TableCell>
                    <TableCell>
                      <Badge
                        variant={subscriptionStatusVariant(subscription.status)}
                      >
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(subscription.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Payments</CardTitle>
          <CardDescription>Pembayaran langganan & booking</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Referensi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground py-8 text-center text-sm"
                  >
                    Belum ada pembayaran.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={`${payment.type}-${payment.id}`}>
                    <TableCell className="capitalize">{payment.type}</TableCell>
                    <TableCell>{payment.reference}</TableCell>
                    <TableCell>
                      <PaymentRecordStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(payment.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
