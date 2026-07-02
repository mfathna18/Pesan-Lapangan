"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavItems } from "@/config/dashboard-nav";
import { cn } from "@/lib/utils";

type DashboardNavProps = {
  onNavigate?: () => void;
};

export function DashboardNav({ onNavigate }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Navigasi dashboard">
      {dashboardNavItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-medium transition-colors duration-150",
              isActive
                ? "bg-primary/10 text-primary font-semibold shadow-[var(--shadow-subtle)]"
                : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
