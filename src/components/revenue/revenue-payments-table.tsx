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
        <CardTitle>Pembayaran Terbaru</CardTitle>
        <CardDescription>
          Pembayaran dalam rentang tanggal yang dipilih
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor Booking</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibayar Pada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Tidak ada pembayaran pada rentang tanggal ini.
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
