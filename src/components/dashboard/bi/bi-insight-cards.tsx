import type { BiInsightCard } from "@/domains/analytics/analytics-types";
import { radius, shadow, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type BiInsightCardsProps = {
  insights: BiInsightCard[];
};

const VARIANT_STYLES: Record<BiInsightCard["variant"], string> = {
  default: "border-border bg-card",
  success: "border-emerald-500/20 bg-emerald-500/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  muted: "border-border/80 bg-muted/30",
};

export function BiInsightCards({ insights }: BiInsightCardsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className={typography.h3}>Insight Bisnis</h2>
        <p className={typography.caption}>
          Ringkasan pola booking, lapangan, dan performa bulan ini.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className={cn(
              "space-y-3 border p-5",
              radius.card,
              shadow.card,
              VARIANT_STYLES[insight.variant],
            )}
          >
            <p className={typography.label}>{insight.title}</p>
            <p className={typography.stat}>{insight.value}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {insight.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
