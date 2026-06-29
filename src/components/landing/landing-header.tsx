import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  return (
    <header className="border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a
            href="#cara-kerja"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Cara Kerja
          </a>
          <a
            href="#kategori"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Kategori
          </a>
          <a
            href="#keunggulan"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Keunggulan
          </a>
        </nav>

        <a
          href="#cari-lapangan"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "md:hidden",
          )}
        >
          Cari
        </a>
      </div>
    </header>
  );
}
