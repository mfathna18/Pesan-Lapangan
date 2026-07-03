import { z } from "zod";

import {
  GOR_DEFAULT_TIMEZONE,
  GOR_TIMEZONE_VALUES,
} from "@/domains/owner/constants";

const optionalUrlField = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (value) => !value || z.string().url().safeParse(value).success,
    "Must be a valid URL.",
  );

export const updateGorProfileSchema = z.object({
  name: z.string().trim().min(1, "GOR name is required."),
  phone: z.string().trim().optional().nullable(),
  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      "Email is invalid.",
    ),
  address: z.string().trim().min(1, "Address is required."),
  city: z.string().trim().min(1, "City is required."),
  province: z.string().trim().min(1, "Province is required."),
  description: z.string().trim().optional().nullable(),
  logoUrl: optionalUrlField,
  coverImageUrl: optionalUrlField,
  timezone: z.enum(GOR_TIMEZONE_VALUES).default(GOR_DEFAULT_TIMEZONE),
  bankName: z.string().trim().optional().nullable(),
  bankAccountNumber: z.string().trim().optional().nullable(),
  bankAccountHolder: z.string().trim().optional().nullable(),
  qrisImageUrl: optionalUrlField,
});

export type UpdateGorProfileActionInput = z.infer<
  typeof updateGorProfileSchema
>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
