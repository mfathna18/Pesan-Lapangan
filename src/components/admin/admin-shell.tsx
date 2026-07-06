"use client";

import { useEffect, useState } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { dashboardLayout } from "@/lib/layout-system";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

type AdminShellUser = {
  name: string;
  email: string;
  image?: string | null;
};

type AdminShellProps = {
  user: AdminShellUser;
  children: React.ReactNode;
};

export function AdminShell({ user, children }: AdminShellProps) {
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
      <AdminSidebar
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
        <AdminTopbar user={user} onMenuClick={() => setMobileOpen(true)} />

        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
