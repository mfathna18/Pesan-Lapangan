import { BOOKING_DURATION_INTERVAL_MINUTES } from "@/domains/booking/constants";
import { z } from "zod";

const indonesianPhoneSchema = z
  .string()
  .trim()
  .min(1, "Nomor telepon wajib diisi.")
  .refine((value) => {
    const normalized = value.replace(/[\s-]/g, "");

    return /^(\+62|62|0)[0-9]{8,13}$/.test(normalized);
  }, "Format nomor telepon tidak valid.");

export const createBookingContactSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required."),
  customerPhone: z.string().trim().min(1, "Customer phone is required."),
  note: z.string().trim().optional().nullable(),
});

export const publicBookingContactSchema = z.object({
  customerName: z.string().trim().min(1, "Nama wajib diisi."),
  customerPhone: indonesianPhoneSchema,
  note: z.string().trim().optional().nullable(),
});

export const publicBookingFormSearchParamsSchema = z.object({
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal booking tidak valid."),
  startMinute: z.coerce
    .number()
    .int()
    .min(0, "Waktu booking tidak valid.")
    .max(1439, "Waktu booking tidak valid."),
  endMinute: z.coerce.number().int().min(1).max(1440).optional(),
  price: z.coerce.number().int().min(0).optional(),
});

export type PublicBookingFormSearchParams = z.infer<
  typeof publicBookingFormSearchParamsSchema
>;

export const createPublicBookingSchema = z.object({
  gorSlug: z.string().trim().min(1, "Venue slug is required."),
  courtId: z.string().trim().min(1, "Court is required."),
  bookingDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal booking tidak valid."),
  startMinute: z.coerce
    .number()
    .int()
    .min(0)
    .max(1439, "Waktu booking tidak valid."),
  durationMinute: z
    .number()
    .int()
    .refine(
      (value) => value === BOOKING_DURATION_INTERVAL_MINUTES,
      `Durasi booking harus ${BOOKING_DURATION_INTERVAL_MINUTES} menit.`,
    ),
  contact: publicBookingContactSchema,
});

export type CreatePublicBookingActionInput = z.infer<
  typeof createPublicBookingSchema
>;

export const createBookingSchema = z.object({
  courtId: z.string().trim().min(1, "Court is required."),
  bookingDate: z.coerce.date({
    message: "Booking date is invalid.",
  }),
  startMinute: z
    .number()
    .int("Start minute must be an integer.")
    .min(0, "Start minute must be at least 0.")
    .max(1439, "Start minute must be at most 1439."),
  durationMinute: z
    .number()
    .int("Duration must be an integer.")
    .refine(
      (value) => value === BOOKING_DURATION_INTERVAL_MINUTES,
      `Booking duration must be ${BOOKING_DURATION_INTERVAL_MINUTES} minutes.`,
    ),
  contact: createBookingContactSchema,
});

export type CreateBookingActionInput = z.infer<typeof createBookingSchema>;

export const listBookingsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(["newest", "oldest"]).default("newest"),
  courtId: z.string().trim().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  bookingDate: z.string().trim().optional(),
  bookingNumberSearch: z.string().trim().optional(),
});

export type ListBookingsActionInput = z.infer<typeof listBookingsSchema>;

export const getBookingDetailSchema = z.object({
  id: z.string().trim().min(1, "Booking id is required."),
});

export type GetBookingDetailActionInput = z.infer<
  typeof getBookingDetailSchema
>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
