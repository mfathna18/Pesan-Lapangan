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
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function getBookingDetailAction(
  input: unknown,
): Promise<ActionResponse<BookingDetail>> {
  const session = await requireOwnerSession();

  const parsed = getBookingDetailSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const detail = await getBookingService().getBookingDetail(
      parsed.data.id,
      ownerId,
    );

    return actionSuccess(detail);
  } catch (error) {
    return handleServerActionError("getBookingDetailAction", error, {
      fallbackMessage: "Gagal memuat detail booking.",
      knownErrors: [createKnownActionError(BookingNotFoundError)],
    });
  }
}
