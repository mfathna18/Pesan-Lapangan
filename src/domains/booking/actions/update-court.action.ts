"use server";

import { getCourtService } from "@/domains/booking/actions/get-court-service";
import {
  formatZodError,
  updateCourtSchema,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import {
  CourtNotFoundError,
  CourtValidationError,
} from "@/domains/booking/errors";
import type { OwnerCourtListItem } from "@/domains/booking/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function updateCourtAction(
  input: unknown,
): Promise<ActionResponse<OwnerCourtListItem>> {
  const session = await requireOwnerSession();

  const parsed = updateCourtSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const court = await getCourtService().updateCourtForOwner(
      ownerId,
      parsed.data.courtId,
      parsed.data,
    );

    return actionSuccess(court);
  } catch (error) {
    return handleServerActionError("updateCourtAction", error, {
      fallbackMessage: "Gagal memperbarui lapangan.",
      knownErrors: [
        createKnownActionError(CourtValidationError),
        createKnownActionError(CourtNotFoundError),
      ],
    });
  }
}
