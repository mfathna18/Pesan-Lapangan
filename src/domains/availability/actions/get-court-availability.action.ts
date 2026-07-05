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
import { parseVenueDateInput } from "@/domains/booking/utils/venue-date";
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
        fallbackMessage: "Gagal memuat lapangan.",
        knownErrors: [
          createKnownActionError(
            CourtNotFoundError,
            "Lapangan tidak ditemukan.",
          ),
        ],
      },
    );
  }

  let bookingDate: Date;

  try {
    bookingDate = parseVenueDateInput(parsed.data.bookingDate);
  } catch {
    return actionFailure("Tanggal booking tidak valid.");
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
        fallbackMessage: "Gagal memuat ketersediaan.",
      },
    );
  }
}
