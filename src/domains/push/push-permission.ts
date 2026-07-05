import {
  PUSH_PERMISSION_DISMISS_KEY,
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

export async function requestBrowserNotificationPermission(): Promise<PushPermissionState> {
  if (!isBrowserNotificationSupported()) {
    return PUSH_PERMISSION_STATE.UNSUPPORTED;
  }

  if (Notification.permission === PUSH_PERMISSION_STATE.GRANTED) {
    return PUSH_PERMISSION_STATE.GRANTED;
  }

  if (Notification.permission === PUSH_PERMISSION_STATE.DENIED) {
    return PUSH_PERMISSION_STATE.DENIED;
  }

  const result = await Notification.requestPermission();
  return result as PushPermissionState;
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

export function readPermissionDismissedAt(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PUSH_PERMISSION_DISMISS_KEY);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function markPermissionDismissedNow(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PUSH_PERMISSION_DISMISS_KEY, String(Date.now()));
}

export function shouldShowPermissionPrompt(
  dismissDays: number,
  settingsEnabled: boolean,
): boolean {
  if (!settingsEnabled) {
    return false;
  }

  const permission = getBrowserNotificationPermission();

  if (
    permission !== PUSH_PERMISSION_STATE.DEFAULT ||
    !isBrowserNotificationSupported()
  ) {
    return false;
  }

  const dismissedAt = readPermissionDismissedAt();

  if (!dismissedAt) {
    return true;
  }

  const dismissMs = dismissDays * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedAt > dismissMs;
}
