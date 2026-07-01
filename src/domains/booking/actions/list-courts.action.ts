"use server";

import { getCourtService } from "@/domains/booking/actions/get-court-service";
import {
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import type { OwnerCourtListItem } from "@/domains/booking/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { handleServerActionError } from "@/lib/server/actions";

export async function listCourtsAction(): Promise<
  ActionResponse<OwnerCourtListItem[]>
> {
  const session = await requireOwnerSession();

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const courts = await getCourtService().listCourtsForOwner(ownerId);

    return actionSuccess(courts);
  } catch (error) {
    return handleServerActionError("listCourtsAction", error, {
      fallbackMessage: "Gagal memuat lapangan.",
    });
  }
}
