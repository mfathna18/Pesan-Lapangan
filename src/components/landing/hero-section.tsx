import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { landingContent } from "@/config/landing";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { hero } = landingContent;

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
      <div className="from-primary/10 via-background to-background absolute inset-0 -z-10 bg-gradient-to-b" />
      <div className="bg-primary/20 absolute top-0 right-0 -z-10 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">
            {hero.eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base text-pretty sm:text-lg">
            {hero.description}
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="#cari-lapangan"
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}
          >
            {hero.searchButton}
          </Link>
        </div>
      </div>
    </section>
  );
}
