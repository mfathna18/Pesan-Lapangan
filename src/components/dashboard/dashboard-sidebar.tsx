"use client";

import Image from "next/image";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { dashboardLayout } from "@/lib/layout-system";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  mobileOpen: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

export function DashboardSidebar({
  mobileOpen,
  collapsed,
  onClose,
  onToggleCollapse,
}: DashboardSidebarProps) {
  return (
    <>
      <div
        aria-hidden={!mobileOpen}
        className={cn(
          "bg-foreground/20 fixed inset-0 z-40 transition-opacity duration-200 motion-reduce:transition-none lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-50 flex flex-col border-r shadow-[var(--shadow-sm)] transition-[width,transform] duration-200 motion-reduce:transition-none lg:translate-x-0",
          collapsed
            ? dashboardLayout.sidebarCollapsedClass
            : dashboardLayout.sidebarExpandedClass,
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          className={cn(
            "border-sidebar-border flex h-[4.5rem] shrink-0 items-center border-b",
            collapsed ? "justify-center px-2" : "justify-between gap-3 px-5",
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex min-w-0 items-center",
              collapsed ? "justify-center" : "gap-3",
            )}
            title="Beranda Dashboard"
          >
            <Image
              src="/icon.png"
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-[var(--radius-md)]"
              aria-hidden
            />
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight">
                  <span className="text-primary">Pesan</span>Lapangan
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  Panel Pemilik
                </p>
              </div>
            ) : null}
          </Link>

          {!collapsed ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={onClose}
              aria-label="Tutup menu"
            >
              <X />
            </Button>
          ) : null}
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto py-4",
            collapsed ? "px-2" : "px-3",
          )}
        >
          <DashboardNav collapsed={collapsed} onNavigate={onClose} />
        </div>

        <div
          className={cn(
            "border-sidebar-border hidden shrink-0 border-t p-3 lg:block",
            collapsed && "px-2",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? "icon-sm" : "default"}
            className={cn("w-full", !collapsed && "justify-start gap-2")}
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            {!collapsed ? <span>Ciutkan</span> : null}
          </Button>
        </div>
      </aside>
    </>
  );
}
