import type { NotificationType } from "@/generated/prisma/client";
import {
  Ban,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  TriangleAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { NOTIFICATION_TYPE } from "@/domains/notification/constants";

const notificationIcons: Record<NotificationType, LucideIcon> = {
  BOOKING_CREATED: CalendarDays,
  PAYMENT_AWAITING_CONFIRMATION: Clock3,
  PAYMENT_APPROVED: CheckCircle2,
  PAYMENT_REJECTED: XCircle,
  BOOKING_CANCELLED: Ban,
  SUBSCRIPTION_EXPIRING: TriangleAlert,
  SUBSCRIPTION_ACTIVATED: Sparkles,
};

export function getNotificationIcon(type: NotificationType): LucideIcon {
  return notificationIcons[type] ?? Bell;
}

export function formatNotificationRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));

  if (minutes < 1) {
    return "Baru saja";
  }

  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} jam lalu`;
  }

  const days = Math.floor(hours / 24);

  return `${days} hari lalu`;
}

export function isPaymentNotification(type: NotificationType): boolean {
  return (
    type === NOTIFICATION_TYPE.PAYMENT_AWAITING_CONFIRMATION ||
    type === NOTIFICATION_TYPE.PAYMENT_APPROVED ||
    type === NOTIFICATION_TYPE.PAYMENT_REJECTED
  );
}
