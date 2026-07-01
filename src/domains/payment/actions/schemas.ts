import { z } from "zod";

export const createPublicPaymentSchema = z.object({
  gorSlug: z.string().trim().min(1, "Venue slug is required."),
  bookingId: z.string().trim().min(1, "Booking id is required."),
});

export const getPublicCheckoutStatusSchema = z.object({
  gorSlug: z.string().trim().min(1, "Venue slug wajib diisi."),
  bookingId: z.string().trim().min(1, "Booking id wajib diisi."),
});

export type CreatePublicPaymentActionInput = z.infer<
  typeof createPublicPaymentSchema
>;

export function formatPaymentZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
