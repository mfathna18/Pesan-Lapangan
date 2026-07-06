"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavItems } from "@/config/admin-nav";
import { cn } from "@/lib/utils";

type AdminNavProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ collapsed = false, onNavigate }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Admin navigation">
      {adminNavItems.map((item) => {
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
              collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
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
  );
}
