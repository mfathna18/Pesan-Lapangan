"use client";

import { Menu } from "lucide-react";

import { DashboardProfileMenu } from "@/components/dashboard/dashboard-profile-menu";
import { NotificationBell } from "@/components/notification/notification-bell";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { Button } from "@/components/ui/button";
import type { OwnerBrowserNotificationSettingsData } from "@/domains/push/push-types";
import type { OwnerNotificationListResult } from "@/domains/notification/types";
import { layout } from "@/lib/design-system";

type DashboardTopbarUser = {
  name: string;
  email: string;
  image?: string | null;
};

type DashboardTopbarProps = {
  user: DashboardTopbarUser;
  initialNotifications: OwnerNotificationListResult;
  browserNotificationSettings: OwnerBrowserNotificationSettingsData;
  onMenuClick: () => void;
};

export function DashboardTopbar({
  user,
  initialNotifications,
  browserNotificationSettings,
  onMenuClick,
}: DashboardTopbarProps) {
  return (
    <header className={`${layout.header} z-30`}>
      <div className="flex h-[4.5rem] items-center gap-4 px-4 lg:px-8">
        <Button
          variant="outline"
          size="icon-sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Buka menu"
        >
          <Menu />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <PwaInstallButton />
          <NotificationBell
            initialData={initialNotifications}
            browserNotificationSettings={browserNotificationSettings}
          />
          <DashboardProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
