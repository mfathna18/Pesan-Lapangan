import { findBookingsForExport } from "@/domains/export/readers/export-read-repository";
import type { ExportCustomersQuery } from "@/domains/export/schemas";
import type { ExportFileResult, ExportTable } from "@/domains/export/types";
import { buildExportFile } from "@/domains/export/utils/export-file-builder";
import {
  formatExportAmount,
  formatExportDate,
  formatExportDateTime,
} from "@/domains/export/utils/export-labels";

type CustomerAggregate = {
  customerName: string;
  customerPhone: string;
  bookingCount: number;
  totalSpent: number;
  lastBookingDate: Date;
  lastBookingAt: Date;
};

function sumPaidAmount(
  booking: Awaited<ReturnType<typeof findBookingsForExport>>[number],
): number {
  return booking.payments
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + payment.amount, 0);
}

function aggregateCustomers(
  bookings: Awaited<ReturnType<typeof findBookingsForExport>>,
): CustomerAggregate[] {
  const customers = new Map<string, CustomerAggregate>();

  for (const booking of bookings) {
    if (booking.status === "CANCELLED") {
      continue;
    }

    const paidAmount = sumPaidAmount(booking);
    const phoneKey =
      booking.customerPhone.trim() || booking.customerName.trim();
    const existing = customers.get(phoneKey);

    if (!existing) {
      customers.set(phoneKey, {
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        bookingCount: 1,
        totalSpent: paidAmount,
        lastBookingDate: booking.bookingDate,
        lastBookingAt: booking.createdAt,
      });
      continue;
    }

    existing.bookingCount += 1;
    existing.totalSpent += paidAmount;

    if (booking.bookingDate > existing.lastBookingDate) {
      existing.lastBookingDate = booking.bookingDate;
    }

    if (booking.createdAt > existing.lastBookingAt) {
      existing.lastBookingAt = booking.createdAt;
    }
  }

  return Array.from(customers.values()).sort(
    (left, right) => right.bookingCount - left.bookingCount,
  );
}

function buildCustomerExportTable(customers: CustomerAggregate[]): ExportTable {
  const headers = [
    "Nama Pelanggan",
    "Telepon",
    "Jumlah Booking",
    "Total Belanja (IDR)",
    "Booking Terakhir",
    "Terakhir Dibuat",
  ];

  const rows = customers.map((customer) => [
    customer.customerName,
    customer.customerPhone,
    String(customer.bookingCount),
    formatExportAmount(customer.totalSpent),
    formatExportDate(customer.lastBookingDate),
    formatExportDateTime(customer.lastBookingAt),
  ]);

  const totalBookings = customers.reduce(
    (sum, customer) => sum + customer.bookingCount,
    0,
  );
  const totalSpent = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0,
  );

  return {
    title: "Export Pelanggan",
    headers,
    rows,
    summary: [
      { label: "Total Pelanggan Unik", value: customers.length },
      { label: "Total Booking", value: totalBookings },
      { label: "Total Belanja (IDR)", value: totalSpent },
    ],
  };
}

export async function exportCustomersFile(
  ownerId: string,
  query: ExportCustomersQuery,
): Promise<ExportFileResult> {
  const bookings = await findBookingsForExport(ownerId, query);
  const customers = aggregateCustomers(bookings);
  const table = buildCustomerExportTable(customers);

  return buildExportFile({
    format: query.format,
    table,
    fileBaseName: "pelanggan",
  });
}
