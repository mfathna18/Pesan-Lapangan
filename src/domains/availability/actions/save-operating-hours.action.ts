"use server";

import { OperatingHoursValidationError } from "@/domains/availability/errors";
import { getOperatingHoursService } from "@/domains/availability/actions/get-operating-hours-service";
import {
  formatZodError,
  saveOperatingHoursSchema,
} from "@/domains/availability/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/availability/actions/types";
import type { OwnerOperatingHoursSchedule } from "@/domains/availability/types";
import { CourtNotFoundError } from "@/domains/booking/errors";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function saveOperatingHoursAction(
  input: unknown,
): Promise<ActionResponse<OwnerOperatingHoursSchedule>> {
  const session = await requireOwnerSession();

  const parsed = saveOperatingHoursSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const schedule = await getOperatingHoursService().saveScheduleForOwnerCourt(
      ownerId,
      {
        courtId: parsed.data.courtId,
        days: parsed.data.days,
      },
    );

    return actionSuccess(schedule);
  } catch (error) {
    return handleServerActionError("saveOperatingHoursAction", error, {
      fallbackMessage: "Gagal menyimpan jam operasional.",
      knownErrors: [
        createKnownActionError(CourtNotFoundError),
        createKnownActionError(OperatingHoursValidationError),
      ],
    });
  }
}
