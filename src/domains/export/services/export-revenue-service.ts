import { PAYMENT_STATUS } from "@/domains/payment/constants";
import {
  parseOptionalDateInput,
  parseRevenueDateRangePreset,
  resolveRevenueDateRange,
} from "@/domains/payment/utils/revenue-date-range";
import { findRevenuePaymentsForExport } from "@/domains/export/readers/export-read-repository";
import type { ExportRevenueQuery } from "@/domains/export/schemas";
import type { ExportFileResult, ExportTable } from "@/domains/export/types";
import { buildExportFile } from "@/domains/export/utils/export-file-builder";
import {
  formatExportAmount,
  formatExportDateTime,
  formatExportPaymentStatus,
} from "@/domains/export/utils/export-labels";

function buildRevenueExportTable(
  payments: Awaited<ReturnType<typeof findRevenuePaymentsForExport>>,
  rangeLabel: string,
): ExportTable {
  const headers = [
    "Nomor Booking",
    "Pelanggan",
    "Jumlah (IDR)",
    "Status Pembayaran",
    "Metode",
    "Waktu Bayar",
    "Dibuat",
  ];

  const rows = payments.map((payment) => [
    payment.bookingNumber,
    payment.customerName,
    formatExportAmount(payment.amount),
    formatExportPaymentStatus(payment.status),
    payment.method,
    formatExportDateTime(payment.paidAt),
    formatExportDateTime(payment.createdAt),
  ]);

  const paidPayments = payments.filter(
    (payment) => payment.status === PAYMENT_STATUS.PAID,
  );
  const totalRevenue = paidPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  return {
    title: "Export Pendapatan",
    headers,
    rows,
    summary: [
      { label: "Periode", value: rangeLabel },
      { label: "Total Transaksi", value: payments.length },
      { label: "Pembayaran Lunas", value: paidPayments.length },
      {
        label: "Pembayaran Menunggu",
        value: payments.filter(
          (payment) => payment.status === PAYMENT_STATUS.PENDING,
        ).length,
      },
      { label: "Total Pendapatan (IDR)", value: totalRevenue },
    ],
  };
}

export async function exportRevenueFile(
  ownerId: string,
  query: ExportRevenueQuery,
): Promise<ExportFileResult> {
  const preset = parseRevenueDateRangePreset(query.range);
  const customFrom = parseOptionalDateInput(query.from);
  const customTo = parseOptionalDateInput(query.to);
  const { from, to } = resolveRevenueDateRange(
    preset,
    new Date(),
    customFrom,
    customTo,
  );

  const payments = await findRevenuePaymentsForExport(ownerId, from, to);
  const rangeLabel = `${formatExportDateTime(from)} s/d ${formatExportDateTime(to)}`;
  const table = buildRevenueExportTable(payments, rangeLabel);

  return buildExportFile({
    format: query.format,
    table,
    fileBaseName: "pendapatan",
  });
}
