import type {
  AdminBookingPaymentRow,
  AdminSubscriptionPaymentRow,
} from "@/domains/admin/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";
import { PaymentRecordStatusBadge } from "@/components/revenue/payment-record-status-badge";
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
import { pageLayout } from "@/lib/layout-system";

type AdminPaymentsTablesProps = {
  subscriptionPayments: AdminSubscriptionPaymentRow[];
  bookingPayments: AdminBookingPaymentRow[];
};

function formatDateTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminPaymentsTables({
  subscriptionPayments,
  bookingPayments,
}: AdminPaymentsTablesProps) {
  return (
    <div className={pageLayout.cardStack}>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Payments</CardTitle>
          <CardDescription>Pembayaran langganan SaaS platform</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionPayments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-10 text-center text-sm"
                  >
                    Belum ada pembayaran langganan.
                  </TableCell>
                </TableRow>
              ) : (
                subscriptionPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.ownerName}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{payment.targetPlan}</TableCell>
                    <TableCell>{payment.billingAction}</TableCell>
                    <TableCell>
                      <PaymentRecordStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(payment.paidAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Payments</CardTitle>
          <CardDescription>Pembayaran booking pelanggan</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingPayments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-10 text-center text-sm"
                  >
                    Belum ada pembayaran booking.
                  </TableCell>
                </TableRow>
              ) : (
                bookingPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.bookingNumber}
                    </TableCell>
                    <TableCell>{payment.customerName}</TableCell>
                    <TableCell>{payment.gorName}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <PaymentRecordStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(payment.paidAt)}</TableCell>
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
