import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  Download,
  MapPin,
  Minus,
  Tags,
} from "lucide-react";

import type { BiQuickAction } from "@/domains/analytics/analytics-types";
import { radius, shadow, transition, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

const ACTION_ICONS: Record<string, typeof MapPin> = {
  "add-court": MapPin,
  pricing: Tags,
  "operating-hours": Clock,
  export: Download,
  bookings: CalendarDays,
};

type BiQuickActionsProps = {
  actions: BiQuickAction[];
};

export function BiQuickActions({ actions }: BiQuickActionsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className={typography.h3}>Aksi Cepat</h2>
        <p className={typography.caption}>
          Langkah operasional yang sering dibutuhkan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = ACTION_ICONS[action.id] ?? CalendarDays;

          return (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                "group border-border bg-card flex flex-col gap-3 border p-5",
                radius.card,
                shadow.card,
                transition,
                "hover:border-primary/30 hover:shadow-md",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-5" aria-hidden />
                </div>
                <ArrowUpRight className="text-muted-foreground size-4 opacity-0 group-hover:opacity-100" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold tracking-tight">{action.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function BiTrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") {
    return <ArrowUpRight className="size-4 text-emerald-600" aria-hidden />;
  }

  if (trend === "down") {
    return <ArrowDownRight className="size-4 text-amber-600" aria-hidden />;
  }

  return <Minus className="text-muted-foreground size-4" aria-hidden />;
}
