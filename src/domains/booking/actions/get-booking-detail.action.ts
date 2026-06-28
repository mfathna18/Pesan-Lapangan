"use server";

import { getBookingService } from "@/domains/booking/actions/get-booking-service";
import {
  formatZodError,
  getBookingDetailSchema,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import { BookingNotFoundError } from "@/domains/booking/errors";
import type { BookingDetail } from "@/domains/booking/types";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export async function getBookingDetailAction(
  input: unknown,
): Promise<ActionResponse<BookingDetail>> {
  await requireOwnerSession();

  const parsed = getBookingDetailSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const detail = await getBookingService().getBookingDetail(parsed.data.id);

    return actionSuccess(detail);
  } catch (error) {
    if (error instanceof BookingNotFoundError) {
      return actionFailure(error.message);
    }

    return actionFailure("Failed to load booking detail.");
  }
}
