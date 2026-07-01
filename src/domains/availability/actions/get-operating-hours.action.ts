"use server";

import { getOperatingHoursService } from "@/domains/availability/actions/get-operating-hours-service";
import {
  formatZodError,
  getOperatingHoursSchema,
} from "@/domains/availability/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/availability/actions/types";
import { CourtNotFoundError } from "@/domains/booking/errors";
import type { OwnerOperatingHoursSchedule } from "@/domains/availability/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function getOperatingHoursAction(
  input: unknown,
): Promise<ActionResponse<OwnerOperatingHoursSchedule>> {
  const session = await requireOwnerSession();

  const parsed = getOperatingHoursSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const schedule = await getOperatingHoursService().getScheduleForOwnerCourt(
      ownerId,
      parsed.data.courtId,
    );

    return actionSuccess(schedule);
  } catch (error) {
    return handleServerActionError("getOperatingHoursAction", error, {
      fallbackMessage: "Gagal memuat jam operasional.",
      knownErrors: [createKnownActionError(CourtNotFoundError)],
    });
  }
}
