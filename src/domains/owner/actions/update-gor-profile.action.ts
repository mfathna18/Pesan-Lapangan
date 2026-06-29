"use server";

import { getGorProfileService } from "@/domains/owner/actions/get-gor-profile-service";
import {
  formatZodError,
  updateGorProfileSchema,
} from "@/domains/owner/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/owner/actions/types";
import {
  GorProfileValidationError,
  GorSlugConflictError,
  OwnerNotFoundError,
} from "@/domains/owner/errors";
import type { GorProfileData } from "@/domains/owner/types";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function updateGorProfileAction(
  input: unknown,
): Promise<ActionResponse<GorProfileData>> {
  const session = await requireOwnerSession();

  const parsed = updateGorProfileSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const profile = await getGorProfileService().updateForUser(
      session.user.id,
      parsed.data,
    );

    return actionSuccess(profile);
  } catch (error) {
    return handleServerActionError("updateGorProfileAction", error, {
      fallbackMessage: "Failed to save GOR profile.",
      knownErrors: [
        createKnownActionError(OwnerNotFoundError),
        createKnownActionError(GorProfileValidationError),
        createKnownActionError(GorSlugConflictError),
      ],
    });
  }
}
