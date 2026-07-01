import { buttonVariants } from "@/components/ui/button";
import { landingContent } from "@/config/landing";
import { cn } from "@/lib/utils";

export function CtaSection() {
  const { cta } = landingContent;

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />

          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
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
                  "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 w-full sm:w-auto",
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
