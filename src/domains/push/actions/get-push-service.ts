import { createPushSettingsRepository } from "@/domains/push/repositories/push-settings-repository";
import { createPushService } from "@/domains/push/push-service";
import { prisma } from "@/lib/db/prisma";

export function getPushService() {
  return createPushService({
    settingsRepository: createPushSettingsRepository(prisma),
  });
}
