"use server";

import { getCourtService } from "@/domains/booking/actions/get-court-service";
import {
  courtIdSchema,
  formatZodError,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import { CourtNotFoundError } from "@/domains/booking/errors";
import { revalidatePublicVenueForOwnerId } from "@/domains/owner/utils/revalidate-owner-venue";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function deleteCourtAction(
  input: unknown,
): Promise<ActionResponse<{ courtId: string }>> {
  const session = await requireOwnerSession();

  const parsed = courtIdSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    await getCourtService().deleteCourtForOwner(ownerId, parsed.data.courtId);

    await revalidatePublicVenueForOwnerId(ownerId);

    return actionSuccess({ courtId: parsed.data.courtId });
  } catch (error) {
    return handleServerActionError("deleteCourtAction", error, {
      fallbackMessage: "Gagal menghapus lapangan.",
      knownErrors: [createKnownActionError(CourtNotFoundError)],
    });
  }
}
