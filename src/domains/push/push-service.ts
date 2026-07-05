import type { PushSettingsRepository } from "@/domains/push/repositories/push-settings-repository";
import type { UpdateOwnerBrowserNotificationSettingsInput } from "@/domains/push/push-types";

type PushServiceDependencies = {
  settingsRepository: PushSettingsRepository;
};

export class PushService {
  constructor(private readonly settingsRepository: PushSettingsRepository) {}

  getSettingsForOwner(ownerId: string) {
    return this.settingsRepository.getOrCreate(ownerId);
  }

  updateSettingsForOwner(
    ownerId: string,
    input: UpdateOwnerBrowserNotificationSettingsInput,
  ) {
    return this.settingsRepository.update(ownerId, input);
  }
}

export function createPushService(
  dependencies: PushServiceDependencies,
): PushService {
  return new PushService(dependencies.settingsRepository);
}
