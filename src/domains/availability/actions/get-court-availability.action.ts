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
    if (error instanceof CourtNotFoundError) {
      return actionFailure("Court not found.");
    }

    return actionFailure("Failed to load court.");
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
  } catch {
    return actionFailure("Failed to load availability.");
  }
}
