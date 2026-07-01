"use server";

import { getCourtService } from "@/domains/booking/actions/get-court-service";
import {
  formatZodError,
  setCourtActiveSchema,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import { CourtNotFoundError } from "@/domains/booking/errors";
import type { OwnerCourtListItem } from "@/domains/booking/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function setCourtActiveAction(
  input: unknown,
): Promise<ActionResponse<OwnerCourtListItem>> {
  const session = await requireOwnerSession();

  const parsed = setCourtActiveSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const court = await getCourtService().setCourtActiveForOwner(
      ownerId,
      parsed.data.courtId,
      parsed.data.isActive,
    );

    return actionSuccess(court);
  } catch (error) {
    return handleServerActionError("setCourtActiveAction", error, {
      fallbackMessage: "Gagal memperbarui status lapangan.",
      knownErrors: [createKnownActionError(CourtNotFoundError)],
    });
  }
}
