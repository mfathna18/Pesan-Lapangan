export const EXPORT_FORMAT = {
  CSV: "csv",
  XLSX: "xlsx",
} as const;

export type ExportFormat = (typeof EXPORT_FORMAT)[keyof typeof EXPORT_FORMAT];

export const EXPORT_MAX_ROWS = 10_000 as const;

export const EXPORT_BOOKING_PAGE_SIZE = 50 as const;

export const EXPORT_INVOICE_PAGE_SIZE = 100 as const;

export const EXPORT_SHEET_NAMES = {
  DATA: "Data",
  SUMMARY: "Summary",
} as const;
