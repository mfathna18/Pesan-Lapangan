"use client";

import { Menu } from "lucide-react";

import { DashboardProfileMenu } from "@/components/dashboard/dashboard-profile-menu";
import { Button } from "@/components/ui/button";
import { layout } from "@/lib/design-system";

type DashboardTopbarUser = {
  name: string;
  email: string;
  image?: string | null;
};

type DashboardTopbarProps = {
  user: DashboardTopbarUser;
  onMenuClick: () => void;
};

export function DashboardTopbar({ user, onMenuClick }: DashboardTopbarProps) {
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

        <DashboardProfileMenu user={user} />
      </div>
    </header>
  );
}
