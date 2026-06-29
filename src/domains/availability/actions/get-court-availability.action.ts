"use server";

import { getAvailabilityService } from "@/domains/availability/actions/get-availability-service";
import {
  formatZodError,
  getCourtAvailabilitySchema,
} from "@/domains/availability/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/availability/actions/types";
import type { AvailabilitySlot } from "@/domains/availability/types";
import { getCourtService } from "@/domains/booking/actions/get-court-service";
import { CourtNotFoundError } from "@/domains/booking/errors";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function getCourtAvailabilityAction(
  input: unknown,
): Promise<ActionResponse<AvailabilitySlot[]>> {
  const parsed = getCourtAvailabilitySchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    await getCourtService().getPublicCourtDetail(
      parsed.data.gorSlug,
      parsed.data.courtId,
    );
  } catch (error) {
    return handleServerActionError(
      "getCourtAvailabilityAction.loadCourt",
      error,
      {
        fallbackMessage: "Failed to load court.",
        knownErrors: [
          createKnownActionError(CourtNotFoundError, "Court not found."),
        ],
      },
    );
  }

  const bookingDate = new Date(`${parsed.data.bookingDate}T00:00:00`);

  if (Number.isNaN(bookingDate.getTime())) {
    return actionFailure("Booking date is invalid.");
  }

  try {
    const slots = await getAvailabilityService().getSlotGrid({
      courtId: parsed.data.courtId,
      date: bookingDate,
    });

    return actionSuccess(slots);
  } catch (error) {
    return handleServerActionError(
      "getCourtAvailabilityAction.loadAvailability",
      error,
      {
        fallbackMessage: "Failed to load availability.",
      },
    );
  }
}
