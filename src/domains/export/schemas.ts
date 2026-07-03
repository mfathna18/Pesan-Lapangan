import { z } from "zod";

import { REVENUE_DATE_RANGE } from "@/domains/payment/constants";

import { EXPORT_FORMAT } from "./constants";

export const exportFormatSchema = z.enum([
  EXPORT_FORMAT.CSV,
  EXPORT_FORMAT.XLSX,
]);

export const exportBookingsQuerySchema = z.object({
  format: exportFormatSchema.default(EXPORT_FORMAT.CSV),
  sort: z.enum(["newest", "oldest"]).default("newest"),
  courtId: z.string().trim().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  bookingDate: z.string().trim().optional(),
  bookingNumberSearch: z.string().trim().optional(),
});

export const exportInvoicesQuerySchema = z.object({
  format: exportFormatSchema.default(EXPORT_FORMAT.CSV),
  invoiceNumberSearch: z.string().trim().optional(),
  bookingNumberSearch: z.string().trim().optional(),
});

export const exportCustomersQuerySchema = exportBookingsQuerySchema;

export const exportRevenueQuerySchema = z.object({
  format: exportFormatSchema.default(EXPORT_FORMAT.CSV),
  range: z
    .enum([
      REVENUE_DATE_RANGE.TODAY,
      REVENUE_DATE_RANGE.SEVEN_DAYS,
      REVENUE_DATE_RANGE.THIRTY_DAYS,
      REVENUE_DATE_RANGE.CUSTOM,
    ])
    .default(REVENUE_DATE_RANGE.THIRTY_DAYS),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
});

export type ExportBookingsQuery = z.infer<typeof exportBookingsQuerySchema>;
export type ExportInvoicesQuery = z.infer<typeof exportInvoicesQuerySchema>;
export type ExportCustomersQuery = z.infer<typeof exportCustomersQuerySchema>;
export type ExportRevenueQuery = z.infer<typeof exportRevenueQuerySchema>;

export function formatExportZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Parameter export tidak valid.";
}
