import { z } from "zod";

export const getCourtAvailabilitySchema = z.object({
  gorSlug: z.string().trim().min(1, "Venue slug is required."),
  courtId: z.string().trim().min(1, "Court id is required."),
  bookingDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Booking date is invalid."),
});

export type GetCourtAvailabilityActionInput = z.infer<
  typeof getCourtAvailabilitySchema
>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
