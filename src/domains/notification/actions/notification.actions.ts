"use server";

import { getNotificationService } from "@/domains/notification/actions/get-notification-service";
import type { NotificationFilter } from "@/domains/notification/constants";
import type { OwnerNotificationListResult } from "@/domains/notification/types";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import {
  getCachedOwnerId,
  getCachedOwnerSession,
} from "@/lib/auth/cached-owner-request";

export async function listNotificationsAction(input?: {
  filter?: NotificationFilter;
}): Promise<ActionResponse<OwnerNotificationListResult>> {
  const session = await getCachedOwnerSession();
  const ownerId = await getCachedOwnerId(session.user.id);

  try {
    const data = await getNotificationService().listForOwner({
      ownerId,
      filter: input?.filter ?? "all",
    });

    return actionSuccess(data);
  } catch {
    return actionFailure("Gagal memuat notifikasi.");
  }
}

export async function listRecentNotificationsAction(): Promise<
  ActionResponse<OwnerNotificationListResult>
> {
  const session = await getCachedOwnerSession();
  const ownerId = await getCachedOwnerId(session.user.id);

  try {
    const data = await getNotificationService().listRecentForOwner(ownerId);

    return actionSuccess(data);
  } catch {
    return actionFailure("Gagal memuat notifikasi.");
  }
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await getCachedOwnerSession();
  const ownerId = await getCachedOwnerId(session.user.id);

  try {
    await getNotificationService().markAsRead(ownerId, notificationId);

    return actionSuccess({ read: true });
  } catch {
    return actionFailure("Gagal menandai notifikasi.");
  }
}

export async function markAllNotificationsReadAction() {
  const session = await getCachedOwnerSession();
  const ownerId = await getCachedOwnerId(session.user.id);

  try {
    await getNotificationService().markAllAsRead(ownerId);

    return actionSuccess({ read: true });
  } catch {
    return actionFailure("Gagal menandai semua notifikasi.");
  }
}
