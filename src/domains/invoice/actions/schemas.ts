import { z } from "zod";

export const listOwnerInvoicesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  invoiceNumberSearch: z.string().trim().optional(),
  bookingNumberSearch: z.string().trim().optional(),
});

export const getOwnerInvoiceDetailSchema = z.object({
  invoiceId: z.string().trim().min(1, "Invoice id is required."),
});

export function formatInvoiceZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
