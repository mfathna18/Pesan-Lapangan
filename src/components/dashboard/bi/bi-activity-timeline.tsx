import {
  CalendarPlus,
  CircleDollarSign,
  FileText,
  XCircle,
} from "lucide-react";

import { formatActivityTimestamp } from "@/domains/analytics/analytics-formatters";
import type { BiActivityEvent } from "@/domains/analytics/analytics-types";
import { radius, shadow, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

const ACTIVITY_CONFIG: Record<
  BiActivityEvent["type"],
  { icon: typeof CalendarPlus; label: string; accent: string }
> = {
  booking_created: {
    icon: CalendarPlus,
    label: "Booking",
    accent: "bg-primary/10 text-primary",
  },
  payment_received: {
    icon: CircleDollarSign,
    label: "Pembayaran",
    accent: "bg-emerald-500/10 text-emerald-700",
  },
  invoice_generated: {
    icon: FileText,
    label: "Invoice",
    accent: "bg-sky-500/10 text-sky-700",
  },
  booking_cancelled: {
    icon: XCircle,
    label: "Dibatalkan",
    accent: "bg-amber-500/10 text-amber-700",
  },
};

type BiActivityTimelineProps = {
  events: BiActivityEvent[];
};

export function BiActivityTimeline({ events }: BiActivityTimelineProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className={typography.h3}>Aktivitas Terbaru</h2>
        <p className={typography.caption}>
          Timeline booking, pembayaran, invoice, dan pembatalan.
        </p>
      </div>

      <div
        className={cn(
          "divide-border border-border bg-card divide-y border",
          radius.card,
          shadow.card,
        )}
      >
        {events.length === 0 ? (
          <p className="text-muted-foreground p-6 text-sm">
            Belum ada aktivitas terbaru.
          </p>
        ) : (
          events.map((event, index) => {
            const config = ACTIVITY_CONFIG[event.type];
            const Icon = config.icon;

            return (
              <div key={event.id} className="flex gap-4 p-4 sm:p-5">
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      config.accent,
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </div>
                  {index < events.length - 1 ? (
                    <span className="bg-border mt-2 w-px flex-1" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{event.title}</p>
                    <time
                      className="text-muted-foreground text-xs tabular-nums"
                      dateTime={event.timestamp}
                    >
                      {formatActivityTimestamp(event.timestamp)}
                    </time>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
