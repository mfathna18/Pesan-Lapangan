import { EXPORT_FORMAT, EXPORT_SHEET_NAMES } from "@/domains/export/constants";
import type {
  ExportBuildInput,
  ExportFileResult,
} from "@/domains/export/types";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function buildCsvContent(headers: string[], rows: string[][]): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(",")),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

export function buildExportFilename(
  baseName: string,
  format: (typeof EXPORT_FORMAT)[keyof typeof EXPORT_FORMAT],
): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${baseName}-${timestamp}.${format}`;
}

export async function buildExportFile(
  input: ExportBuildInput,
): Promise<ExportFileResult> {
  if (input.format === EXPORT_FORMAT.CSV) {
    const csv = buildCsvContent(input.table.headers, input.table.rows);

    return {
      buffer: Buffer.from(csv, "utf-8"),
      filename: buildExportFilename(input.fileBaseName, EXPORT_FORMAT.CSV),
      contentType: "text/csv; charset=utf-8",
    };
  }

  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PesanLapangan";
  workbook.created = new Date();

  const dataSheet = workbook.addWorksheet(EXPORT_SHEET_NAMES.DATA);
  dataSheet.addRow(input.table.headers);
  input.table.rows.forEach((row) => {
    dataSheet.addRow(row);
  });

  dataSheet.getRow(1).font = { bold: true };
  dataSheet.columns.forEach((column) => {
    column.width = 18;
  });

  const summarySheet = workbook.addWorksheet(EXPORT_SHEET_NAMES.SUMMARY);
  summarySheet.addRow(["Ringkasan", input.table.title]);
  summarySheet.addRow([]);
  summarySheet.addRow(["Metrik", "Nilai"]);
  input.table.summary.forEach((item) => {
    summarySheet.addRow([item.label, item.value]);
  });
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(3).font = { bold: true };
  summarySheet.columns = [{ width: 32 }, { width: 24 }];

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

  return {
    buffer,
    filename: buildExportFilename(input.fileBaseName, EXPORT_FORMAT.XLSX),
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
