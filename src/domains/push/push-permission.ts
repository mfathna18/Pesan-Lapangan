import {
  PUSH_PERMISSION_STATE,
  type PushPermissionState,
} from "@/domains/push/push-types";

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserNotificationPermission(): PushPermissionState {
  if (!isBrowserNotificationSupported()) {
    return PUSH_PERMISSION_STATE.UNSUPPORTED;
  }

  return Notification.permission as PushPermissionState;
}

export function isStandalonePwaDisplayMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  );
}
