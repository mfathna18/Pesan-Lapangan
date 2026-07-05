"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { NotificationListItem } from "@/components/notification/notification-list-item";
import { Button, buttonVariants } from "@/components/ui/button";
import { POLL_INTERVALS } from "@/config/polling-intervals";
import {
  listRecentNotificationsAction,
  markNotificationReadAction,
} from "@/domains/notification/actions/notification.actions";
import type { OwnerNotificationListResult } from "@/domains/notification/types";
import { focusRing, transition } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { usePolling } from "@/hooks/use-polling";
import { useOwnerBrowserNotificationSync } from "@/hooks/use-owner-browser-notification-sync";
import type { OwnerBrowserNotificationSettingsData } from "@/domains/push/push-types";

type NotificationBellProps = {
  initialData: OwnerNotificationListResult;
  browserNotificationSettings: OwnerBrowserNotificationSettingsData;
};

export function NotificationBell({
  initialData,
  browserNotificationSettings,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(initialData);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const refreshNotifications = useCallback(async () => {
    const response = await listRecentNotificationsAction();

    if (response.success) {
      setData(response.data);
    }
  }, []);

  usePolling(refreshNotifications, POLL_INTERVALS.NOTIFICATIONS_MS);
  useOwnerBrowserNotificationSync(data.items, browserNotificationSettings);

  async function handleMarkRead(notificationId: string) {
    const response = await markNotificationReadAction(notificationId);

    if (response.success) {
      setData((current) => ({
        unreadCount: Math.max(0, current.unreadCount - 1),
        items: current.items.map((item) =>
          item.id === notificationId
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      }));
    }
  }

  const unreadLabel = data.unreadCount > 99 ? "99+" : String(data.unreadCount);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className={cn("relative", focusRing, transition)}
        aria-label={
          data.unreadCount > 0
            ? `Notifikasi, ${data.unreadCount} belum dibaca`
            : "Notifikasi"
        }
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="size-4" aria-hidden />
        {data.unreadCount > 0 ? (
          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] font-semibold">
            {unreadLabel}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          className="border-border bg-background absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-[var(--radius-card)] border shadow-lg"
          role="menu"
        >
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Notifikasi</p>
            {data.unreadCount > 0 ? (
              <span className="text-muted-foreground text-xs">
                {data.unreadCount} belum dibaca
              </span>
            ) : null}
          </div>

          <div className="max-h-[24rem] overflow-y-auto p-2">
            {data.items.length === 0 ? (
              <div className="text-muted-foreground px-3 py-8 text-center text-sm">
                Belum ada notifikasi.
              </div>
            ) : (
              data.items.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  compact
                  onNavigate={() => setOpen(false)}
                  onMarkRead={handleMarkRead}
                />
              ))
            )}
          </div>

          <div className="border-border border-t p-2">
            <Link
              href="/dashboard/notifications"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full",
              )}
              onClick={() => setOpen(false)}
            >
              Lihat Semua
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
