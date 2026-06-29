import { PaymentRecordStatusBadge } from "@/components/revenue/payment-record-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDateTime,
} from "@/domains/booking/utils/booking-display";
import type { RecentPaymentItem } from "@/domains/payment/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RevenuePaymentsTableProps = {
  payments: RecentPaymentItem[];
};

export function RevenuePaymentsTable({ payments }: RevenuePaymentsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>
          Payments within the selected date range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No payments found for this date range.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.bookingNumber}
                  </TableCell>
                  <TableCell>{payment.customerName}</TableCell>
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
  );
}
