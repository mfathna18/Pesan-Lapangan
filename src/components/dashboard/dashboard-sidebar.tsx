"use client";

import { X } from "lucide-react";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function DashboardSidebar({
  mobileOpen,
  onClose,
}: DashboardSidebarProps) {
  return (
    <>
      <div
        aria-hidden={!mobileOpen}
        className={cn(
          "bg-foreground/20 fixed inset-0 z-40 transition-opacity duration-150 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r shadow-[var(--shadow-subtle)] transition-transform duration-150 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              {siteConfig.name}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              Panel Pemilik
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <DashboardNav onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
