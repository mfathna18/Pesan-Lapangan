import { findInvoicesForExport } from "@/domains/export/readers/export-read-repository";
import type { ExportInvoicesQuery } from "@/domains/export/schemas";
import type { ExportFileResult, ExportTable } from "@/domains/export/types";
import { buildExportFile } from "@/domains/export/utils/export-file-builder";
import {
  formatExportAmount,
  formatExportDate,
  formatExportDateTime,
  formatExportInvoiceStatus,
  formatExportPaymentStatus,
} from "@/domains/export/utils/export-labels";

function buildInvoiceExportTable(
  invoices: Awaited<ReturnType<typeof findInvoicesForExport>>,
): ExportTable {
  const headers = [
    "Nomor Invoice",
    "Nomor Booking",
    "Pelanggan",
    "Lapangan",
    "Tanggal Main",
    "Total (IDR)",
    "Status Invoice",
    "Status Pembayaran",
    "Diterbitkan",
  ];

  const rows = invoices.map((invoice) => [
    invoice.invoiceNumber,
    invoice.bookingNumber,
    invoice.customerName,
    invoice.courtName,
    formatExportDate(invoice.bookingDate),
    formatExportAmount(invoice.totalAmount),
    formatExportInvoiceStatus(invoice.status),
    formatExportPaymentStatus(invoice.paymentStatus),
    formatExportDateTime(invoice.generatedAt),
  ]);

  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0,
  );

  return {
    title: "Export Invoice",
    headers,
    rows,
    summary: [
      { label: "Total Invoice", value: invoices.length },
      { label: "Total Nilai Invoice (IDR)", value: totalAmount },
      {
        label: "Invoice Lunas",
        value: invoices.filter((invoice) => invoice.paymentStatus === "PAID")
          .length,
      },
    ],
  };
}

export async function exportInvoicesFile(
  ownerId: string,
  query: ExportInvoicesQuery,
): Promise<ExportFileResult> {
  const invoices = await findInvoicesForExport(ownerId, query);
  const table = buildInvoiceExportTable(invoices);

  return buildExportFile({
    format: query.format,
    table,
    fileBaseName: "invoice",
  });
}
