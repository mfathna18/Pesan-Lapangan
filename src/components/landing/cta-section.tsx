import { buttonVariants } from "@/components/ui/button";
import { landingContent } from "@/config/landing";
import { layout, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export function CtaSection() {
  const { cta } = landingContent;

  return (
    <section className={layout.section}>
      <div className={layout.container}>
        <div className="bg-primary text-primary-foreground rounded-[var(--radius-card-lg)] px-6 py-14 text-center shadow-[var(--shadow-elevated)] sm:px-12 sm:py-16">
          <div className="mx-auto max-w-2xl space-y-8">
            <h2 className={cn(typography.h2, "text-primary-foreground")}>
              {cta.title}
            </h2>
            <p className="text-primary-foreground/85 text-base text-pretty sm:text-lg">
              {cta.description}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="#cari-lapangan"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "w-full sm:w-auto",
                )}
              >
                {cta.primaryButton}
              </a>
              <a
                href="#cara-kerja"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 w-full sm:w-auto",
                )}
              >
                {cta.secondaryButton}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
