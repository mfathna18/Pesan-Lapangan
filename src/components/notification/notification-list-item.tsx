"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { OwnerNotificationItem } from "@/domains/notification/types";
import {
  formatNotificationRelativeTime,
  getNotificationIcon,
} from "@/domains/notification/utils/notification-display";
import { cn } from "@/lib/utils";

type NotificationListItemProps = {
  notification: OwnerNotificationItem;
  compact?: boolean;
  onNavigate?: () => void;
  onMarkRead?: (notificationId: string) => void;
};

export function NotificationListItem({
  notification,
  compact = false,
  onNavigate,
  onMarkRead,
}: NotificationListItemProps) {
  const router = useRouter();
  const Icon = getNotificationIcon(notification.type);
  const isUnread = notification.readAt == null;
  const content = (
    <>
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          isUnread
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug",
              isUnread ? "font-semibold" : "font-medium",
            )}
          >
            {notification.title}
          </p>
          {isUnread ? (
            <span
              className="bg-primary mt-1.5 size-2 shrink-0 rounded-full"
              aria-hidden
            />
          ) : null}
        </div>
        <p
          className={cn(
            "text-muted-foreground leading-relaxed",
            compact ? "line-clamp-2 text-xs" : "text-sm",
          )}
        >
          {notification.description}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatNotificationRelativeTime(notification.createdAt)}
        </p>
      </div>
    </>
  );

  if (!notification.href) {
    return (
      <div
        className={cn(
          "flex gap-3 rounded-[var(--radius-card)] p-3",
          isUnread && "bg-primary/5",
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={notification.href}
      onClick={() => {
        if (isUnread) {
          onMarkRead?.(notification.id);
        }
        onNavigate?.();
        router.refresh();
      }}
      className={cn(
        "hover:bg-muted/60 flex gap-3 rounded-[var(--radius-card)] p-3 transition-colors",
        isUnread && "bg-primary/5",
      )}
    >
      {content}
    </Link>
  );
}
