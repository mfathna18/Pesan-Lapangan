"use server";

import { getCourtService } from "@/domains/booking/actions/get-court-service";
import {
  createCourtSchema,
  formatZodError,
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

export async function createCourtAction(
  input: unknown,
): Promise<ActionResponse<OwnerCourtListItem>> {
  const session = await requireOwnerSession();

  const parsed = createCourtSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const court = await getCourtService().createCourtForOwner(
      ownerId,
      parsed.data,
    );

    return actionSuccess(court);
  } catch (error) {
    return handleServerActionError("createCourtAction", error, {
      fallbackMessage: "Gagal membuat lapangan.",
      knownErrors: [
        createKnownActionError(CourtValidationError),
        createKnownActionError(CourtNotFoundError),
      ],
    });
  }
}
