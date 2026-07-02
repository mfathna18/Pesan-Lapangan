import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { landingContent } from "@/config/landing";
import { layout, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { hero } = landingContent;

  return (
    <section className={`${layout.section} pb-12 sm:pb-16 lg:pb-20`}>
      <div className={`${layout.container} flex flex-col items-center gap-12`}>
        <div className="mx-auto max-w-4xl space-y-8 text-center">
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

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="#cari-lapangan"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            {hero.searchButton}
          </Link>
          <Link
            href="#cara-kerja"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Lihat Cara Kerja
          </Link>
        </div>
      </div>
    </section>
  );
}
