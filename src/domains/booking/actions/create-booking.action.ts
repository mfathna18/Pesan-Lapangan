"use server";

import { getBookingService } from "@/domains/booking/actions/get-booking-service";
import {
  createBookingSchema,
  formatZodError,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import { BookingValidationError } from "@/domains/booking/errors";
import type { BookingWithContact } from "@/domains/booking/repositories/booking-repository";

export async function createBookingAction(
  input: unknown,
): Promise<ActionResponse<BookingWithContact>> {
  const parsed = createBookingSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const booking = await getBookingService().create(parsed.data);

    return actionSuccess(booking);
  } catch (error) {
    if (error instanceof BookingValidationError) {
      return actionFailure(error.message);
    }

    return actionFailure("Failed to create booking.");
  }
}
