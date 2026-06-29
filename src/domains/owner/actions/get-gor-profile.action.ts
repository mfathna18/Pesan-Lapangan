"use server";

import { getGorProfileService } from "@/domains/owner/actions/get-gor-profile-service";
import {
  actionSuccess,
  type ActionResponse,
} from "@/domains/owner/actions/types";
import { OwnerNotFoundError } from "@/domains/owner/errors";
import type { GorProfileData } from "@/domains/owner/types";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function getGorProfileAction(): Promise<
  ActionResponse<GorProfileData | null>
> {
  const session = await requireOwnerSession();

  try {
    const profile = await getGorProfileService().getForUser(session.user.id);

    return actionSuccess(profile);
  } catch (error) {
    return handleServerActionError("getGorProfileAction", error, {
      fallbackMessage: "Failed to load GOR profile.",
      knownErrors: [createKnownActionError(OwnerNotFoundError)],
    });
  }
}
