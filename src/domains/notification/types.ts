import type {
  NotificationCategory,
  NotificationType,
} from "@/generated/prisma/client";

import type { NotificationFilter } from "@/domains/notification/constants";

export type OwnerNotificationItem = {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  description: string;
  href: string | null;
  bookingId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type OwnerNotificationListResult = {
  items: OwnerNotificationItem[];
  unreadCount: number;
};

export type CreateOwnerNotificationInput = {
  ownerId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  description: string;
  href?: string | null;
  bookingId?: string | null;
};

export type ListOwnerNotificationsInput = {
  ownerId: string;
  filter: NotificationFilter;
  limit?: number;
};
