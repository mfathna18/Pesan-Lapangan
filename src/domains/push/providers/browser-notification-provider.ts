import {
  PUSH_PROVIDER_NAME,
  type BrowserNotificationPayload,
  type PushNotificationProvider,
} from "@/domains/push/push-types";

const NOTIFICATION_ICON = "/icon.png";

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export class BrowserNotificationProvider implements PushNotificationProvider {
  readonly name = PUSH_PROVIDER_NAME.BROWSER;

  canNotify(): boolean {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    );
  }

  async show(payload: BrowserNotificationPayload): Promise<void> {
    if (!this.canNotify()) {
      return;
    }

    const registration = await getServiceWorkerRegistration();

    if (registration) {
      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: NOTIFICATION_ICON,
        badge: NOTIFICATION_ICON,
        tag: payload.tag,
        data: { url: payload.url },
      });
      return;
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: NOTIFICATION_ICON,
      tag: payload.tag,
      data: { url: payload.url },
    });

    notification.onclick = () => {
      window.focus();
      window.location.assign(payload.url);
      notification.close();
    };
  }
}

export class NoopPushNotificationProvider implements PushNotificationProvider {
  readonly name = PUSH_PROVIDER_NAME.NOOP;

  canNotify(): boolean {
    return false;
  }

  async show(): Promise<void> {
    // noop
  }
}

export function createBrowserNotificationProvider(): PushNotificationProvider {
  if (typeof window === "undefined") {
    return new NoopPushNotificationProvider();
  }

  return new BrowserNotificationProvider();
}
