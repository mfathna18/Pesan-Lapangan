export const PUSH_PROVIDER_NAME = {
  BROWSER: "browser",
  NOOP: "noop",
} as const;

export type PushProviderName =
  (typeof PUSH_PROVIDER_NAME)[keyof typeof PUSH_PROVIDER_NAME];

export const PUSH_PERMISSION_STATE = {
  GRANTED: "granted",
  DENIED: "denied",
  DEFAULT: "default",
  UNSUPPORTED: "unsupported",
} as const;

export type PushPermissionState =
  (typeof PUSH_PERMISSION_STATE)[keyof typeof PUSH_PERMISSION_STATE];

export const PUSH_EVENT = {
  OWNER_BOOKING_CREATED: "OWNER_BOOKING_CREATED",
  OWNER_PAYMENT_AWAITING: "OWNER_PAYMENT_AWAITING",
  OWNER_BOOKING_CANCELLED: "OWNER_BOOKING_CANCELLED",
  OWNER_PAYMENT_REJECTED: "OWNER_PAYMENT_REJECTED",
  OWNER_SUBSCRIPTION_EXPIRING: "OWNER_SUBSCRIPTION_EXPIRING",
  CUSTOMER_PAYMENT_APPROVED: "CUSTOMER_PAYMENT_APPROVED",
  CUSTOMER_PAYMENT_REJECTED: "CUSTOMER_PAYMENT_REJECTED",
  CUSTOMER_BOOKING_REMINDER: "CUSTOMER_BOOKING_REMINDER",
} as const;

export type PushEvent = (typeof PUSH_EVENT)[keyof typeof PUSH_EVENT];

export type OwnerBrowserNotificationSettingsData = {
  enabled: boolean;
  notifyBooking: boolean;
  notifyPayment: boolean;
  notifyReminder: boolean;
  notifySubscription: boolean;
};

export type UpdateOwnerBrowserNotificationSettingsInput =
  OwnerBrowserNotificationSettingsData;

export type BrowserNotificationPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

export type PushNotificationProvider = {
  readonly name: PushProviderName;
  canNotify(): boolean;
  show(payload: BrowserNotificationPayload): Promise<void>;
};

export const PUSH_ACTIVATION_CARD_DISMISS_KEY =
  "pesan-lapangan-browser-notification-card-dismissed";

export const CUSTOMER_PUSH_ENABLED_KEY = "pesan-lapangan-customer-push-enabled";

export const PUSH_NOTIFIED_IDS_KEY = "pesan-lapangan-browser-notified-ids";

export const PWA_INSTALLED_KEY = "pesan-lapangan-pwa-installed";
