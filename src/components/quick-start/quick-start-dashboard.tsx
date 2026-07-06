import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Lightbulb } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { QUICK_START_STEPS } from "@/domains/quick-start/constants";
import type { QuickStartProgressData } from "@/domains/quick-start/types";
import { layout, radius, shadow, typography } from "@/lib/design-system";
import { pageLayout } from "@/lib/layout-system";
import { cn } from "@/lib/utils";

type QuickStartDashboardProps = {
  progress: QuickStartProgressData;
};

function resolveStepHref(
  stepHref: string,
  publicGorUrl: string | null,
): string | null {
  if (stepHref === "/gor") {
    return publicGorUrl;
  }

  return stepHref;
}

export function QuickStartDashboard({ progress }: QuickStartDashboardProps) {
  const completedById = new Map(
    progress.steps.map((step) => [step.id, step.completed] as const),
  );

  return (
    <div className={`${layout.page} ${pageLayout.cardStack}`}>
      <PageHeader
        eyebrow="Setup"
        title="Panduan Cepat"
        description="Selesaikan langkah-langkah berikut agar GOR Anda siap menerima booking online dalam kurang dari 10 menit."
      />

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Progress Setup</CardTitle>
              <CardDescription>
                {progress.completedCount} / {progress.totalCount} langkah
                selesai
              </CardDescription>
            </div>
            <p
              className={cn(
                typography.stat,
                "text-primary text-2xl sm:text-3xl",
              )}
            >
              {progress.percent}%
            </p>
          </div>

          <div
            className="bg-muted h-2.5 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress setup GOR"
          >
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {progress.allComplete ? (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-4xl" aria-hidden>
              🎉
            </p>
            <p className="text-lg font-semibold tracking-tight">
              GOR Anda siap menerima booking online.
            </p>
            {progress.publicGorUrl ? (
              <Link
                href={progress.publicGorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ className: "mt-2 gap-2" })}
              >
                Lihat Halaman Publik
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {QUICK_START_STEPS.map((step, index) => {
          const completed = completedById.get(step.id) ?? false;
          const href = resolveStepHref(step.href, progress.publicGorUrl);
          const isExternal = step.external && href !== null;

          return (
            <article
              key={step.id}
              className={cn(
                "flex flex-col border p-5",
                radius.card,
                shadow.card,
                completed
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-border bg-card",
              )}
            >
              <div className="flex items-start gap-3">
                {completed ? (
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className="text-muted-foreground mt-0.5 size-5 shrink-0"
                    aria-hidden
                  />
                )}

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Langkah {index + 1}
                    </p>
                    <h2 className={typography.cardTitle}>{step.title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="border-border/60 bg-muted/40 flex gap-2 rounded-lg border p-3">
                    <Lightbulb
                      className="text-primary mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      <span className="text-foreground font-medium">
                        Tips:{" "}
                      </span>
                      {step.tip}
                    </p>
                  </div>

                  {href ? (
                    <Link
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={cn(
                        buttonVariants({
                          variant: completed ? "outline" : "default",
                          size: "sm",
                        }),
                        "inline-flex w-fit items-center gap-2",
                      )}
                    >
                      {step.actionLabel}
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Lengkapi profil GOR terlebih dahulu untuk membuka halaman
                      publik.
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
