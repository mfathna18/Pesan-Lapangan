import { BOOKING_DURATION_INTERVAL_MINUTES } from "@/domains/booking/constants";
import { COURT_SPORT_TYPE_VALUES } from "@/domains/booking/constants";
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
  endMinute: z.coerce
    .number()
    .int()
    .min(1, "Waktu booking tidak valid.")
    .max(1440, "Waktu booking tidak valid."),
  price: z.coerce.number().int().min(0).optional(),
});

export type PublicBookingFormSearchParams = z.infer<
  typeof publicBookingFormSearchParamsSchema
>;

export const createPublicBookingSchema = z
  .object({
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
    endMinute: z.coerce
      .number()
      .int()
      .min(1)
      .max(1440, "Waktu booking tidak valid."),
    contact: publicBookingContactSchema,
  })
  .superRefine((value, context) => {
    if (value.endMinute <= value.startMinute) {
      context.addIssue({
        code: "custom",
        message: "Waktu selesai harus setelah waktu mulai.",
        path: ["endMinute"],
      });
      return;
    }

    const durationMinute = value.endMinute - value.startMinute;

    if (durationMinute % BOOKING_DURATION_INTERVAL_MINUTES !== 0) {
      context.addIssue({
        code: "custom",
        message: `Rentang booking harus kelipatan ${BOOKING_DURATION_INTERVAL_MINUTES} menit.`,
        path: ["endMinute"],
      });
    }
  });

export type CreatePublicBookingActionInput = z.infer<
  typeof createPublicBookingSchema
>;

export const createBookingSchema = z
  .object({
    courtId: z.string().trim().min(1, "Court is required."),
    bookingDate: z.coerce.date({
      message: "Booking date is invalid.",
    }),
    startMinute: z
      .number()
      .int("Start minute must be an integer.")
      .min(0, "Start minute must be at least 0.")
      .max(1439, "Start minute must be at most 1439."),
    endMinute: z
      .number()
      .int("End minute must be an integer.")
      .min(1, "End minute must be at least 1.")
      .max(1440, "End minute must be at most 1440."),
    contact: createBookingContactSchema,
  })
  .superRefine((value, context) => {
    if (value.endMinute <= value.startMinute) {
      context.addIssue({
        code: "custom",
        message: "End time must be after start time.",
        path: ["endMinute"],
      });
      return;
    }

    const durationMinute = value.endMinute - value.startMinute;

    if (durationMinute % BOOKING_DURATION_INTERVAL_MINUTES !== 0) {
      context.addIssue({
        code: "custom",
        message: `Booking range must use ${BOOKING_DURATION_INTERVAL_MINUTES}-minute intervals.`,
        path: ["endMinute"],
      });
    }
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

export const courtIdSchema = z.object({
  courtId: z.string().trim().min(1, "Court id is required."),
});

export const ownerCourtFormSchema = z.object({
  name: z.string().trim().min(1, "Court name is required."),
  sportType: z.enum(COURT_SPORT_TYPE_VALUES, {
    message: "Sport type is required.",
  }),
  isActive: z.boolean(),
});

export const createCourtSchema = ownerCourtFormSchema;

export const updateCourtSchema = ownerCourtFormSchema.extend({
  courtId: z.string().trim().min(1, "Court id is required."),
});

export const setCourtActiveSchema = z.object({
  courtId: z.string().trim().min(1, "Court id is required."),
  isActive: z.boolean(),
});

export type CreateCourtActionInput = z.infer<typeof createCourtSchema>;
export type UpdateCourtActionInput = z.infer<typeof updateCourtSchema>;
export type SetCourtActiveActionInput = z.infer<typeof setCourtActiveSchema>;
export type DeleteCourtActionInput = z.infer<typeof courtIdSchema>;

const priceRuleDayOfWeekSchema = z
  .number()
  .int()
  .refine(
    (value) => [0, 1, 2, 3, 4, 5, 6].includes(value),
    "Invalid day of week.",
  );

export const ownerPriceRuleFormSchema = z.object({
  dayOfWeek: priceRuleDayOfWeekSchema,
  startTime: z.string().trim().min(1, "Start time is required."),
  endTime: z.string().trim().min(1, "End time is required."),
  price: z.coerce
    .number()
    .int("Price must be a whole number.")
    .positive("Price must be greater than zero."),
  isActive: z.boolean(),
});

export const listPriceRulesSchema = z.object({
  courtId: z.string().trim().min(1, "Court is required."),
});

export const createPriceRuleSchema = ownerPriceRuleFormSchema.extend({
  courtId: z.string().trim().min(1, "Court is required."),
});

export const updatePriceRuleSchema = ownerPriceRuleFormSchema.extend({
  courtId: z.string().trim().min(1, "Court is required."),
  priceRuleId: z.string().trim().min(1, "Pricing rule id is required."),
});

export const deletePriceRuleSchema = z.object({
  courtId: z.string().trim().min(1, "Court is required."),
  priceRuleId: z.string().trim().min(1, "Pricing rule id is required."),
});

export const setPriceRuleActiveSchema = z.object({
  courtId: z.string().trim().min(1, "Court is required."),
  priceRuleId: z.string().trim().min(1, "Pricing rule id is required."),
  isActive: z.boolean(),
});

export type ListPriceRulesActionInput = z.infer<typeof listPriceRulesSchema>;
export type CreatePriceRuleActionInput = z.infer<typeof createPriceRuleSchema>;
export type UpdatePriceRuleActionInput = z.infer<typeof updatePriceRuleSchema>;
export type DeletePriceRuleActionInput = z.infer<typeof deletePriceRuleSchema>;
export type SetPriceRuleActiveActionInput = z.infer<
  typeof setPriceRuleActiveSchema
>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
