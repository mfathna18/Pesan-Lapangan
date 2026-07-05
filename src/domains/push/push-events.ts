import { NOTIFICATION_TYPE } from "@/domains/notification/constants";
import type { NotificationType } from "@/generated/prisma/client";
import { PUSH_EVENT, type PushEvent } from "@/domains/push/push-types";

export function mapNotificationTypeToPushEvent(
  type: NotificationType,
): PushEvent | null {
  switch (type) {
    case NOTIFICATION_TYPE.BOOKING_CREATED:
      return PUSH_EVENT.OWNER_BOOKING_CREATED;
    case NOTIFICATION_TYPE.PAYMENT_AWAITING_CONFIRMATION:
      return PUSH_EVENT.OWNER_PAYMENT_AWAITING;
    case NOTIFICATION_TYPE.BOOKING_CANCELLED:
      return PUSH_EVENT.OWNER_BOOKING_CANCELLED;
    case NOTIFICATION_TYPE.PAYMENT_REJECTED:
      return PUSH_EVENT.OWNER_PAYMENT_REJECTED;
    case NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRING:
      return PUSH_EVENT.OWNER_SUBSCRIPTION_EXPIRING;
    default:
      return null;
  }
}

export function isPushEventEnabledForSettings(
  event: PushEvent,
  settings: {
    enabled: boolean;
    notifyBooking: boolean;
    notifyPayment: boolean;
    notifyReminder: boolean;
    notifySubscription: boolean;
  },
): boolean {
  if (!settings.enabled) {
    return false;
  }

  switch (event) {
    case PUSH_EVENT.OWNER_BOOKING_CREATED:
    case PUSH_EVENT.OWNER_BOOKING_CANCELLED:
      return settings.notifyBooking;
    case PUSH_EVENT.OWNER_PAYMENT_AWAITING:
    case PUSH_EVENT.OWNER_PAYMENT_REJECTED:
      return settings.notifyPayment;
    case PUSH_EVENT.OWNER_SUBSCRIPTION_EXPIRING:
      return settings.notifySubscription;
    case PUSH_EVENT.CUSTOMER_BOOKING_REMINDER:
      return settings.notifyReminder;
    case PUSH_EVENT.CUSTOMER_PAYMENT_APPROVED:
    case PUSH_EVENT.CUSTOMER_PAYMENT_REJECTED:
      return true;
    default:
      return false;
  }
}

export function buildNotificationUrl(href: string | null): string {
  if (!href) {
    return "/dashboard";
  }

  return href.startsWith("/") ? href : `/${href}`;
}
