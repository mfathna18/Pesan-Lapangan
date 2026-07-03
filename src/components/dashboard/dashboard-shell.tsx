"use client";

import { useEffect, useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { dashboardLayout } from "@/lib/layout-system";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "dashboard-sidebar-collapsed";

type DashboardShellUser = {
  name: string;
  email: string;
  image?: string | null;
};

type DashboardShellProps = {
  user: DashboardShellUser;
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    setCollapsed(stored === "true");
    setHydrated(true);
  }, []);

  function handleToggleCollapse() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="bg-background min-h-screen">
      <DashboardSidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200 motion-reduce:transition-none",
          hydrated
            ? collapsed
              ? dashboardLayout.mainOffsetCollapsed
              : dashboardLayout.mainOffsetExpanded
            : dashboardLayout.mainOffsetExpanded,
        )}
      >
        <DashboardTopbar user={user} onMenuClick={() => setMobileOpen(true)} />

        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
