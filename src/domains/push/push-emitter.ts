import type { OwnerNotificationItem } from "@/domains/notification/types";
import {
  buildNotificationUrl,
  isPushEventEnabledForSettings,
  mapNotificationTypeToPushEvent,
} from "@/domains/push/push-events";
import { createBrowserNotificationProvider } from "@/domains/push/providers/browser-notification-provider";
import type {
  BrowserNotificationPayload,
  OwnerBrowserNotificationSettingsData,
  PushEvent,
  PushNotificationProvider,
} from "@/domains/push/push-types";
import { PUSH_EVENT } from "@/domains/push/push-types";

const CUSTOMER_EVENT_COPY: Record<
  Extract<
    PushEvent,
    | typeof PUSH_EVENT.CUSTOMER_PAYMENT_APPROVED
    | typeof PUSH_EVENT.CUSTOMER_PAYMENT_REJECTED
    | typeof PUSH_EVENT.CUSTOMER_BOOKING_REMINDER
  >,
  { title: string; body: string }
> = {
  [PUSH_EVENT.CUSTOMER_PAYMENT_APPROVED]: {
    title: "Pembayaran Dikonfirmasi",
    body: "Pembayaran Anda telah dikonfirmasi. Sampai jumpa di GOR.",
  },
  [PUSH_EVENT.CUSTOMER_PAYMENT_REJECTED]: {
    title: "Pembayaran Ditolak",
    body: "Pembayaran belum dapat diverifikasi. Silakan hubungi pengelola.",
  },
  [PUSH_EVENT.CUSTOMER_BOOKING_REMINDER]: {
    title: "Booking Sebentar Lagi",
    body: "Waktu bermain Anda akan segera dimulai.",
  },
};

export class PushEmitter {
  constructor(
    private readonly provider: PushNotificationProvider = createBrowserNotificationProvider(),
  ) {}

  canNotify(): boolean {
    return this.provider.canNotify();
  }

  async emitOwnerNotification(
    notification: OwnerNotificationItem,
    settings: OwnerBrowserNotificationSettingsData,
  ): Promise<void> {
    if (notification.readAt) {
      return;
    }

    const event = mapNotificationTypeToPushEvent(notification.type);

    if (!event || !isPushEventEnabledForSettings(event, settings)) {
      return;
    }

    await this.provider.show({
      title: notification.title,
      body: notification.description,
      url: buildNotificationUrl(notification.href),
      tag: notification.id,
    });
  }

  async emitCustomerEvent(
    event: Extract<
      PushEvent,
      | typeof PUSH_EVENT.CUSTOMER_PAYMENT_APPROVED
      | typeof PUSH_EVENT.CUSTOMER_PAYMENT_REJECTED
      | typeof PUSH_EVENT.CUSTOMER_BOOKING_REMINDER
    >,
    input: {
      url: string;
      body?: string;
      tag: string;
    },
  ): Promise<void> {
    const copy = CUSTOMER_EVENT_COPY[event];

    await this.provider.show({
      title: copy.title,
      body: input.body ?? copy.body,
      url: input.url,
      tag: input.tag,
    });
  }
}

export function createPushEmitter(
  provider?: PushNotificationProvider,
): PushEmitter {
  return new PushEmitter(provider);
}

export async function showBrowserNotification(
  payload: BrowserNotificationPayload,
): Promise<void> {
  await createBrowserNotificationProvider().show(payload);
}
