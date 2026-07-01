import { z } from "zod";

import { OPERATING_HOURS_WEEKDAYS } from "@/domains/availability/constants";
import { isValidTimeValue } from "@/domains/availability/utils/time-input";

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

export const getOwnerCourtAvailabilitySchema = z.object({
  courtId: z.string().trim().min(1, "Court is required."),
  bookingDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Booking date is invalid."),
});

export type GetOwnerCourtAvailabilityActionInput = z.infer<
  typeof getOwnerCourtAvailabilitySchema
>;

const operatingHoursDaySchema = z
  .object({
    dayOfWeek: z
      .number()
      .int()
      .refine(
        (value) =>
          OPERATING_HOURS_WEEKDAYS.some((day) => day.dayOfWeek === value),
        "Invalid day of week.",
      ),
    enabled: z.boolean(),
    startTime: z.string().trim(),
    endTime: z.string().trim(),
  })
  .superRefine((day, context) => {
    if (!day.enabled) {
      return;
    }

    if (!isValidTimeValue(day.startTime)) {
      context.addIssue({
        code: "custom",
        message: "Invalid opening time.",
        path: ["startTime"],
      });
    }

    if (!isValidTimeValue(day.endTime)) {
      context.addIssue({
        code: "custom",
        message: "Invalid closing time.",
        path: ["endTime"],
      });
    }
  });

export const getOperatingHoursSchema = z.object({
  courtId: z.string().trim().min(1, "Court is required."),
});

export const saveOperatingHoursSchema = z.object({
  courtId: z.string().trim().min(1, "Court is required."),
  days: z
    .array(operatingHoursDaySchema)
    .length(
      OPERATING_HOURS_WEEKDAYS.length,
      "All seven days must be provided.",
    ),
});

export type GetOperatingHoursActionInput = z.infer<
  typeof getOperatingHoursSchema
>;
export type SaveOperatingHoursActionInput = z.infer<
  typeof saveOperatingHoursSchema
>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
