"use server";

import { z } from "zod";

import { getWhatsAppService } from "@/domains/whatsapp/actions/get-whatsapp-service";
import type { OwnerWhatsAppSettingsData } from "@/domains/whatsapp/whatsapp-types";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/owner/actions/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

const updateWhatsAppSettingsSchema = z.object({
  enabled: z.boolean(),
  notifyBooking: z.boolean(),
  notifyPayment: z.boolean(),
  notifyReminder: z.boolean(),
  notifySubscription: z.boolean(),
});

export async function getWhatsAppSettingsAction(): Promise<
  ActionResponse<OwnerWhatsAppSettingsData>
> {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  try {
    const settings = await getWhatsAppService().getSettingsForOwner(ownerId);
    return actionSuccess(settings);
  } catch {
    return actionFailure("Gagal memuat pengaturan WhatsApp.");
  }
}

export async function updateWhatsAppSettingsAction(
  input: unknown,
): Promise<ActionResponse<OwnerWhatsAppSettingsData>> {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  const parsed = updateWhatsAppSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure("Data pengaturan WhatsApp tidak valid.");
  }

  try {
    const settings = await getWhatsAppService().updateSettingsForOwner(
      ownerId,
      parsed.data,
    );

    return actionSuccess(settings);
  } catch {
    return actionFailure("Gagal menyimpan pengaturan WhatsApp.");
  }
}
