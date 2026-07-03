"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { focusRing, transition } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type DashboardProfileMenuUser = {
  name: string;
  email: string;
};

type DashboardProfileMenuProps = {
  user: DashboardProfileMenuUser;
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

export function DashboardProfileMenu({ user }: DashboardProfileMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initials = getUserInitials(user.name, user.email);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "border-border hover:bg-muted/60 flex items-center gap-3 rounded-[var(--radius-button)] border px-2 py-1.5 sm:px-3",
          focusRing,
          transition,
        )}
      >
        <div
          className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          aria-hidden
        >
          {initials}
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-40 truncate text-sm font-semibold">{user.name}</p>
          <p className="text-muted-foreground max-w-40 truncate text-xs">
            {user.email}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "text-muted-foreground hidden size-4 shrink-0 sm:block",
            open && "rotate-180",
            transition,
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="border-border bg-popover absolute top-[calc(100%+0.5rem)] right-0 z-50 w-56 rounded-[var(--radius-card)] border p-1.5 shadow-[var(--shadow-lg)]"
        >
          <div className="border-border mb-1.5 border-b px-3 py-2.5 sm:hidden">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {user.email}
            </p>
          </div>

          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              "hover:bg-muted flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
              focusRing,
              transition,
            )}
          >
            <Settings className="size-4" aria-hidden />
            Pengaturan
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className={cn(
              "text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
              focusRing,
              transition,
            )}
          >
            <LogOut className="size-4" aria-hidden />
            Keluar
          </button>
        </div>
      ) : null}
    </div>
  );
}
