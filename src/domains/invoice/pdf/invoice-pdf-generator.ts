import PDFDocument from "pdfkit";

import {
  formatBookingDate,
  formatCurrency,
  formatDateTime,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import type {
  InvoicePdfData,
  InvoicePdfRenderExtensions,
} from "@/domains/invoice/pdf/invoice-pdf-types";
import { getDurationMinutesFromSnapshot } from "@/domains/invoice/utils/invoice-display";

type PdfDocument = InstanceType<typeof PDFDocument>;

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_TEXT = "Terima kasih telah menggunakan PesanLapangan.";

function renderLabelValue(
  doc: PdfDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  valueWidth: number,
): number {
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#666666")
    .text(label, x, y, {
      width: valueWidth,
    });

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#111111")
    .text(value, x, y + 14, {
      width: valueWidth,
    });

  return y + 38;
}

function renderSectionTitle(
  doc: PdfDocument,
  title: string,
  y: number,
): number {
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#111111")
    .text(title, MARGIN, y);

  doc
    .moveTo(MARGIN, y + 18)
    .lineTo(MARGIN + CONTENT_WIDTH, y + 18)
    .strokeColor("#dddddd")
    .lineWidth(1)
    .stroke();

  return y + 28;
}

function renderHourlyBreakdown(
  doc: PdfDocument,
  data: InvoicePdfData,
  startY: number,
): number {
  let y = renderSectionTitle(doc, "Rincian Harga per Jam", startY);

  if (!data.hourlyLineItems || data.hourlyLineItems.length === 0) {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#666666")
      .text("Rincian per jam tidak tersedia pada invoice ini.", MARGIN, y, {
        width: CONTENT_WIDTH,
      });

    return y + 24;
  }

  for (const item of data.hourlyLineItems) {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#111111")
      .text(item.label, MARGIN, y, {
        width: CONTENT_WIDTH * 0.65,
      });

    doc.text(formatCurrency(item.amount), MARGIN, y, {
      width: CONTENT_WIDTH,
      align: "right",
    });

    y += 20;
  }

  return y + 8;
}

function renderExtensionsPlaceholder(
  doc: PdfDocument,
  data: InvoicePdfData,
  extensions: InvoicePdfRenderExtensions,
  y: number,
): number {
  const extensionY = y;

  if (extensions.logoImage) {
    doc.image(extensions.logoImage, PAGE_WIDTH - MARGIN - 80, MARGIN, {
      fit: [80, 80],
    });
  } else if (data.logoUrl) {
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#999999")
      .text("[Logo GOR]", PAGE_WIDTH - MARGIN - 80, MARGIN, {
        width: 80,
        align: "right",
      });
  }

  if (extensions.qrCodeImage) {
    doc.image(extensions.qrCodeImage, MARGIN, extensionY, {
      fit: [96, 96],
    });

    return extensionY + 108;
  }

  if (data.verificationUrl) {
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#999999")
      .text(`[QR Verifikasi: ${data.verificationUrl}]`, MARGIN, extensionY, {
        width: CONTENT_WIDTH,
      });

    return extensionY + 16;
  }

  return extensionY;
}

export function generateInvoicePdfBuffer(
  data: InvoicePdfData,
  extensions: InvoicePdfRenderExtensions = {},
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      info: {
        Title: `Invoice ${data.invoiceNumber}`,
        Author: "PesanLapangan",
      },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on("error", reject);

    const durationMinutes = getDurationMinutesFromSnapshot(
      data.startMinute,
      data.endMinute,
    );

    doc.rect(0, 0, PAGE_WIDTH, 72).fillColor("#0f766e").fill();

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#ffffff")
      .text("PesanLapangan", MARGIN, 24);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#d1fae5")
      .text("Invoice Pembayaran Booking Lapangan", MARGIN, 50);

    renderExtensionsPlaceholder(
      doc,
      data,
      extensions,
      PAGE_HEIGHT - MARGIN - 120,
    );

    let y = 96;

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#111111")
      .text(data.invoiceNumber, MARGIN, y);

    y += 24;

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#666666")
      .text(`Diterbitkan ${formatDateTime(data.generatedAt)}`, MARGIN, y);

    y += 32;

    y = renderSectionTitle(doc, "Informasi Invoice", y);

    const columnWidth = CONTENT_WIDTH / 2 - 12;

    let leftY = y;
    let rightY = y;

    leftY = renderLabelValue(
      doc,
      "Nomor Invoice",
      data.invoiceNumber,
      MARGIN,
      leftY,
      columnWidth,
    );
    leftY = renderLabelValue(
      doc,
      "Nomor Booking",
      data.bookingNumber,
      MARGIN,
      leftY,
      columnWidth,
    );
    leftY = renderLabelValue(
      doc,
      "Status",
      data.paymentStatusLabel,
      MARGIN,
      leftY,
      columnWidth,
    );
    leftY = renderLabelValue(
      doc,
      "Pelanggan",
      data.customerName,
      MARGIN,
      leftY,
      columnWidth,
    );
    leftY = renderLabelValue(
      doc,
      "Telepon",
      data.customerPhone,
      MARGIN,
      leftY,
      columnWidth,
    );

    rightY = renderLabelValue(
      doc,
      "GOR",
      data.venueName,
      MARGIN + columnWidth + 24,
      rightY,
      columnWidth,
    );
    rightY = renderLabelValue(
      doc,
      "Lapangan",
      data.courtName,
      MARGIN + columnWidth + 24,
      rightY,
      columnWidth,
    );
    rightY = renderLabelValue(
      doc,
      "Tanggal Booking",
      formatBookingDate(data.bookingDate),
      MARGIN + columnWidth + 24,
      rightY,
      columnWidth,
    );
    rightY = renderLabelValue(
      doc,
      "Rentang Waktu",
      formatTimeRange(data.startMinute, data.endMinute),
      MARGIN + columnWidth + 24,
      rightY,
      columnWidth,
    );

    y = Math.max(leftY, rightY) + 8;

    y = renderSectionTitle(doc, "Detail Booking", y);

    y = renderLabelValue(
      doc,
      "Durasi",
      `${durationMinutes} menit`,
      MARGIN,
      y,
      CONTENT_WIDTH,
    );

    y = renderHourlyBreakdown(doc, data, y + 4);

    y = renderSectionTitle(doc, "Ringkasan Pembayaran", y + 8);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#111111")
      .text("Total", MARGIN, y, {
        width: CONTENT_WIDTH * 0.65,
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(formatCurrency(data.totalAmount), MARGIN, y - 2, {
        width: CONTENT_WIDTH,
        align: "right",
      });

    y += 36;

    let paymentLeftY = y;
    let paymentRightY = y;

    paymentLeftY = renderLabelValue(
      doc,
      "Metode Pembayaran",
      data.paymentMethodLabel,
      MARGIN,
      paymentLeftY,
      columnWidth,
    );

    paymentRightY = renderLabelValue(
      doc,
      "Referensi Pembayaran",
      data.paymentReference ?? "-",
      MARGIN + columnWidth + 24,
      paymentRightY,
      columnWidth,
    );

    y = Math.max(paymentLeftY, paymentRightY);

    renderLabelValue(
      doc,
      "Tanggal Bayar",
      formatDateTime(data.paidAt),
      MARGIN,
      y,
      CONTENT_WIDTH,
    );

    if (extensions.digitalSignatureImage) {
      doc.image(
        extensions.digitalSignatureImage,
        PAGE_WIDTH - MARGIN - 160,
        y + 8,
        {
          fit: [140, 60],
        },
      );
    } else if (data.digitalSignatureLabel) {
      doc
        .font("Helvetica-Oblique")
        .fontSize(9)
        .fillColor("#666666")
        .text(data.digitalSignatureLabel, PAGE_WIDTH - MARGIN - 160, y + 16, {
          width: 140,
          align: "right",
        });
    }

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#666666")
      .text(FOOTER_TEXT, MARGIN, PAGE_HEIGHT - MARGIN - 20, {
        width: CONTENT_WIDTH,
        align: "center",
      });

    doc.end();
  });
}
