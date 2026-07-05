"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Bell } from "lucide-react";

import { NotificationListItem } from "@/components/notification/notification-list-item";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { POLL_INTERVALS } from "@/config/polling-intervals";
import type { NotificationFilter } from "@/domains/notification/constants";
import {
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/domains/notification/actions/notification.actions";
import type { OwnerNotificationListResult } from "@/domains/notification/types";
import { layout } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { usePolling } from "@/hooks/use-polling";

const filters: { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "unread", label: "Belum Dibaca" },
  { id: "booking", label: "Booking" },
  { id: "payment", label: "Pembayaran" },
  { id: "system", label: "Sistem" },
];

type NotificationCenterProps = {
  initialData: OwnerNotificationListResult;
  initialFilter?: NotificationFilter;
};

export function NotificationCenter({
  initialData,
  initialFilter = "all",
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationFilter>(initialFilter);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const refreshNotifications = useCallback(async () => {
    const response = await listNotificationsAction({ filter });

    if (response.success) {
      setData(response.data);
    }
  }, [filter]);

  usePolling(refreshNotifications, POLL_INTERVALS.NOTIFICATIONS_MS);

  useEffect(() => {
    startTransition(async () => {
      await refreshNotifications();
    });
  }, [filter, refreshNotifications]);

  function handleMarkRead(notificationId: string) {
    startTransition(async () => {
      const response = await markNotificationReadAction(notificationId);

      if (response.success) {
        await refreshNotifications();
      }
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      const response = await markAllNotificationsReadAction();

      if (response.success) {
        await refreshNotifications();
      }
    });
  }

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Pusat Notifikasi"
        title="Notifikasi"
        description="Pantau booking, pembayaran, dan pembaruan langganan venue Anda."
        actions={
          data.unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handleMarkAllRead}
            >
              Tandai Semua Dibaca
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {data.items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Belum ada notifikasi."
            description="Notifikasi booking, pembayaran, dan langganan akan muncul di sini."
            variant="plain"
          />
        ) : (
          data.items.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "border-border rounded-[var(--radius-card)] border",
                notification.readAt == null && "border-primary/20 bg-primary/5",
              )}
            >
              <NotificationListItem
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
