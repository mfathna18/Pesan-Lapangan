"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
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
          "bg-foreground/20 fixed inset-0 z-40 transition-opacity duration-200 motion-reduce:transition-none lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r shadow-[var(--shadow-sm)] transition-transform duration-200 motion-reduce:transition-none lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-sidebar-border flex h-[4.5rem] items-center justify-between gap-3 border-b px-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <Image
              src="/icon.png"
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-[var(--radius-md)]"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">
                <span className="text-primary">Pesan</span>Lapangan
              </p>
              <p className="text-muted-foreground truncate text-xs">
                Panel Pemilik
              </p>
            </div>
          </Link>

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

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <DashboardNav onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
