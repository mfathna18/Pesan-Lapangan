import { resolveBookingPaymentDisplayStatus } from "@/domains/booking/utils/booking-display";
import { findBookingsForExport } from "@/domains/export/readers/export-read-repository";
import type { ExportBookingsQuery } from "@/domains/export/schemas";
import type {
  ExportBuildInput,
  ExportFileResult,
  ExportTable,
} from "@/domains/export/types";
import { buildExportFile } from "@/domains/export/utils/export-file-builder";
import {
  formatExportAmount,
  formatExportBookingStatus,
  formatExportDate,
  formatExportDateTime,
  formatExportPaymentStatus,
  formatExportTimeRange,
} from "@/domains/export/utils/export-labels";

function buildBookingExportTable(
  bookings: Awaited<ReturnType<typeof findBookingsForExport>>,
): ExportTable {
  const headers = [
    "Nomor Booking",
    "Pelanggan",
    "Telepon",
    "Lapangan",
    "Tanggal",
    "Waktu",
    "Durasi (menit)",
    "Total (IDR)",
    "Status Booking",
    "Status Pembayaran",
    "Dibuat",
  ];

  const rows = bookings.map((booking) => {
    const paymentStatus = resolveBookingPaymentDisplayStatus(
      booking.payments as {
        status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
      }[],
    );

    return [
      booking.bookingNumber,
      booking.customerName,
      booking.customerPhone,
      booking.courtNameSnapshot,
      formatExportDate(booking.bookingDate),
      formatExportTimeRange(booking.startMinute, booking.endMinute),
      String(booking.durationMinute),
      formatExportAmount(booking.totalPrice),
      formatExportBookingStatus(booking.status),
      formatExportPaymentStatus(paymentStatus),
      formatExportDateTime(booking.createdAt),
    ];
  });

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0,
  );
  const paidCount = bookings.filter((booking) =>
    booking.payments.some((payment) => payment.status === "PAID"),
  ).length;

  return {
    title: "Export Booking",
    headers,
    rows,
    summary: [
      { label: "Total Booking", value: bookings.length },
      {
        label: "Booking Dikonfirmasi",
        value: bookings.filter((b) => b.status === "CONFIRMED").length,
      },
      {
        label: "Booking Menunggu",
        value: bookings.filter((b) => b.status === "PENDING").length,
      },
      {
        label: "Booking Dibatalkan",
        value: bookings.filter((b) => b.status === "CANCELLED").length,
      },
      { label: "Sudah Dibayar", value: paidCount },
      { label: "Total Nilai Booking (IDR)", value: totalRevenue },
    ],
  };
}

export async function exportBookingsFile(
  ownerId: string,
  query: ExportBookingsQuery,
): Promise<ExportFileResult> {
  const bookings = await findBookingsForExport(ownerId, query);
  const table = buildBookingExportTable(bookings);

  const payload: ExportBuildInput = {
    format: query.format,
    table,
    fileBaseName: "booking",
  };

  return buildExportFile(payload);
}
