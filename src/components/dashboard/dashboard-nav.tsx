"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavGroups } from "@/config/dashboard-nav";
import { cn } from "@/lib/utils";

type DashboardNavProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({
  collapsed = false,
  onNavigate,
}: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {dashboardNavGroups.map((group) => (
        <div key={group.label} className="space-y-1.5">
          {!collapsed ? (
            <p className="text-muted-foreground px-3 pb-1 text-[0.6875rem] font-semibold tracking-widest uppercase">
              {group.label}
            </p>
          ) : (
            <div
              className="border-border mx-auto mb-1 w-6 border-t"
              aria-hidden
            />
          )}

          <nav className="flex flex-col gap-0.5" aria-label={group.label}>
            {group.items.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.title : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center rounded-[var(--radius-button)] text-sm font-medium transition-colors duration-200 motion-reduce:transition-none",
                    collapsed
                      ? "justify-center px-2 py-2.5"
                      : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  {isActive ? (
                    <span
                      className="bg-primary absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full"
                      aria-hidden
                    />
                  ) : null}
                  <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                  {collapsed ? (
                    <span className="sr-only">{item.title}</span>
                  ) : (
                    <span>{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
