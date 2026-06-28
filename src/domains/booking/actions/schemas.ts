import { BOOKING_DURATION_INTERVAL_MINUTES } from "@/domains/booking/constants";
import { z } from "zod";

export const createBookingContactSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required."),
  customerPhone: z.string().trim().min(1, "Customer phone is required."),
  note: z.string().trim().optional().nullable(),
});

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

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
