import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { landingContent } from "@/config/landing";
import { layout, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { hero } = landingContent;

  return (
    <section className={`${layout.section} pb-8 sm:pb-12 lg:pb-16`}>
      <div className={`${layout.container}`}>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 text-center lg:max-w-4xl lg:gap-12">
          <div className="space-y-6">
            <p className={typography.eyebrow}>{hero.eyebrow}</p>
            <h1 className={typography.hero}>{hero.title}</h1>
            <p
              className={cn(
                typography.body,
                "text-muted-foreground mx-auto max-w-2xl text-pretty",
              )}
            >
              {hero.description}
            </p>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="#cari-lapangan"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              {hero.searchButton}
            </Link>
            <Link
              href="#cara-kerja"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              Lihat Cara Kerja
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
