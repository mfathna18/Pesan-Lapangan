import { Lightbulb } from "lucide-react";

import type { BiRecommendation } from "@/domains/analytics/analytics-types";
import { radius, shadow, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type BiRecommendationsProps = {
  recommendations: BiRecommendation[];
};

const PRIORITY_STYLES: Record<BiRecommendation["priority"], string> = {
  high: "border-amber-500/30 bg-amber-500/5",
  medium: "border-border bg-card",
  low: "border-emerald-500/30 bg-emerald-500/5",
};

export function BiRecommendations({ recommendations }: BiRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className={typography.h3}>Rekomendasi Bisnis</h2>
        <p className={typography.caption}>
          Saran berbasis aturan dari data operasional venue Anda.
        </p>
      </div>

      <div className="grid gap-3">
        {recommendations.map((recommendation) => (
          <article
            key={recommendation.id}
            className={cn(
              "flex gap-3 border p-4 sm:p-5",
              radius.card,
              shadow.sm,
              PRIORITY_STYLES[recommendation.priority],
            )}
          >
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Lightbulb className="size-4" aria-hidden />
            </div>
            <p className="text-sm leading-relaxed sm:text-base">
              {recommendation.message}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
