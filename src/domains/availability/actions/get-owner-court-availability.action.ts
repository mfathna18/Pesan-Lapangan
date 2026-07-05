"use server";

import { getAvailabilityService } from "@/domains/availability/actions/get-availability-service";
import {
  formatZodError,
  getOwnerCourtAvailabilitySchema,
} from "@/domains/availability/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/availability/actions/types";
import type { AvailabilitySlot } from "@/domains/availability/types";
import { getCourtRepository } from "@/domains/booking/actions/get-court-repository";
import { CourtNotFoundError } from "@/domains/booking/errors";
import { parseVenueDateInput } from "@/domains/booking/utils/venue-date";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function getOwnerCourtAvailabilityAction(
  input: unknown,
): Promise<ActionResponse<AvailabilitySlot[]>> {
  const session = await requireOwnerSession();

  const parsed = getOwnerCourtAvailabilitySchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const isOwned = await getCourtRepository().isCourtOwnedByOwner(
      parsed.data.courtId,
      ownerId,
    );

    if (!isOwned) {
      throw new CourtNotFoundError();
    }

    let bookingDate: Date;

    try {
      bookingDate = parseVenueDateInput(parsed.data.bookingDate);
    } catch {
      return actionFailure("Tanggal booking tidak valid.");
    }

    const slots = await getAvailabilityService().getSlotGrid({
      courtId: parsed.data.courtId,
      date: bookingDate,
    });

    return actionSuccess(slots);
  } catch (error) {
    return handleServerActionError("getOwnerCourtAvailabilityAction", error, {
      fallbackMessage: "Gagal memuat ketersediaan.",
      knownErrors: [createKnownActionError(CourtNotFoundError)],
    });
  }
}
