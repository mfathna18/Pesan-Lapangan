import type { ExportFormat } from "./constants";

export type ExportSummaryRow = {
  label: string;
  value: string | number;
};

export type ExportFileResult = {
  buffer: Buffer;
  filename: string;
  contentType: string;
};

export type ExportTable = {
  headers: string[];
  rows: string[][];
  summary: ExportSummaryRow[];
  title: string;
};

export type ExportBuildInput = {
  format: ExportFormat;
  table: ExportTable;
  fileBaseName: string;
};
