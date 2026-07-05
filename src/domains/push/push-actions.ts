"use server";

import { z } from "zod";

import { getPushService } from "@/domains/push/actions/get-push-service";
import type { OwnerBrowserNotificationSettingsData } from "@/domains/push/push-types";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/owner/actions/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

const updateBrowserNotificationSettingsSchema = z.object({
  enabled: z.boolean(),
  notifyBooking: z.boolean(),
  notifyPayment: z.boolean(),
  notifyReminder: z.boolean(),
  notifySubscription: z.boolean(),
});

export async function getBrowserNotificationSettingsAction(): Promise<
  ActionResponse<OwnerBrowserNotificationSettingsData>
> {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  try {
    const settings = await getPushService().getSettingsForOwner(ownerId);
    return actionSuccess(settings);
  } catch {
    return actionFailure("Gagal memuat pengaturan notifikasi browser.");
  }
}

export async function updateBrowserNotificationSettingsAction(
  input: unknown,
): Promise<ActionResponse<OwnerBrowserNotificationSettingsData>> {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  const parsed = updateBrowserNotificationSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure("Data pengaturan notifikasi browser tidak valid.");
  }

  try {
    const settings = await getPushService().updateSettingsForOwner(
      ownerId,
      parsed.data,
    );

    return actionSuccess(settings);
  } catch {
    return actionFailure("Gagal menyimpan pengaturan notifikasi browser.");
  }
}
