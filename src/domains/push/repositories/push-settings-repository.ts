import type { PrismaClient } from "@/generated/prisma/client";
import type {
  OwnerBrowserNotificationSettingsData,
  UpdateOwnerBrowserNotificationSettingsInput,
} from "@/domains/push/push-types";

export class PushSettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getOrCreate(
    ownerId: string,
  ): Promise<OwnerBrowserNotificationSettingsData> {
    const settings = await this.prisma.ownerBrowserNotificationSettings.upsert({
      where: { ownerId },
      create: { ownerId },
      update: {},
    });

    return toSettingsData(settings);
  }

  async update(
    ownerId: string,
    input: UpdateOwnerBrowserNotificationSettingsInput,
  ): Promise<OwnerBrowserNotificationSettingsData> {
    const settings = await this.prisma.ownerBrowserNotificationSettings.upsert({
      where: { ownerId },
      create: {
        ownerId,
        ...input,
      },
      update: input,
    });

    return toSettingsData(settings);
  }
}

function toSettingsData(settings: {
  enabled: boolean;
  notifyBooking: boolean;
  notifyPayment: boolean;
  notifyReminder: boolean;
  notifySubscription: boolean;
}): OwnerBrowserNotificationSettingsData {
  return {
    enabled: settings.enabled,
    notifyBooking: settings.notifyBooking,
    notifyPayment: settings.notifyPayment,
    notifyReminder: settings.notifyReminder,
    notifySubscription: settings.notifySubscription,
  };
}

export function createPushSettingsRepository(
  prisma: PrismaClient,
): PushSettingsRepository {
  return new PushSettingsRepository(prisma);
}
