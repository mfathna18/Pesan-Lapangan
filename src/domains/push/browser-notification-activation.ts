import { updateBrowserNotificationSettingsAction } from "@/domains/push/push-actions";
import { isBrowserNotificationSupported } from "@/domains/push/push-permission";
import type { OwnerBrowserNotificationSettingsData } from "@/domains/push/push-types";
import {
  PUSH_PERMISSION_STATE,
  type PushPermissionState,
} from "@/domains/push/push-types";

export const BROWSER_NOTIFICATION_DENIED_MESSAGE =
  "Notifikasi diblokir oleh browser. Anda dapat mengubahnya melalui Site Settings.";

export type BrowserNotificationActivationResult = {
  permission: PushPermissionState;
  settings?: OwnerBrowserNotificationSettingsData;
};

export function isBrowserNotificationActive(
  permission: PushPermissionState,
): boolean {
  return permission === PUSH_PERMISSION_STATE.GRANTED;
}

export async function persistGrantedBrowserNotificationSettings(
  settings: OwnerBrowserNotificationSettingsData,
): Promise<OwnerBrowserNotificationSettingsData | null> {
  const response = await updateBrowserNotificationSettingsAction({
    ...settings,
    enabled: true,
  });

  return response.success ? response.data : null;
}

/**
 * Must be called with Notification.requestPermission() invoked synchronously
 * in the same user-click handler before awaiting this function.
 */
export async function completeBrowserNotificationActivation(
  permission: PushPermissionState,
  settings: OwnerBrowserNotificationSettingsData,
): Promise<BrowserNotificationActivationResult> {
  if (permission === PUSH_PERMISSION_STATE.GRANTED) {
    const savedSettings =
      await persistGrantedBrowserNotificationSettings(settings);

    return {
      permission,
      settings: savedSettings ?? settings,
    };
  }

  return { permission };
}

export function requestPermissionFromUserClick(): Promise<PushPermissionState> {
  if (!isBrowserNotificationSupported()) {
    return Promise.resolve(PUSH_PERMISSION_STATE.UNSUPPORTED);
  }

  if (Notification.permission === PUSH_PERMISSION_STATE.GRANTED) {
    return Promise.resolve(PUSH_PERMISSION_STATE.GRANTED);
  }

  if (Notification.permission === PUSH_PERMISSION_STATE.DENIED) {
    return Promise.resolve(PUSH_PERMISSION_STATE.DENIED);
  }

  return Notification.requestPermission().then(
    (result) => result as PushPermissionState,
  );
}
