"use client";

import { Menu } from "lucide-react";

import { LogoutButton } from "@/components/dashboard/logout-button";
import { Button } from "@/components/ui/button";

type DashboardTopbarUser = {
  name: string;
  email: string;
  image?: string | null;
};

type DashboardTopbarProps = {
  user: DashboardTopbarUser;
  onMenuClick: () => void;
};

function getUserInitials(name: string, email: string): string {
  const trimmedName = name.trim();

  if (trimmedName.length > 0) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }

    return trimmedName.slice(0, 2).toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

export function DashboardTopbar({ user, onMenuClick }: DashboardTopbarProps) {
  const initials = getUserInitials(user.name, user.email);

  return (
    <header className="border-border bg-background/90 sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-md lg:px-8">
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

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="max-w-44 truncate text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground max-w-44 truncate text-xs">
              {user.email}
            </p>
          </div>

          <div
            className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full text-xs font-semibold"
            aria-hidden
          >
            {initials}
          </div>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}
