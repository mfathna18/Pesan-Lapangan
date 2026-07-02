import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { siteConfig } from "@/config/site";

type CourtDetailHeaderProps = {
  gorSlug: string;
  gorName: string;
};

export function CourtDetailHeader({
  gorSlug,
  gorName,
}: CourtDetailHeaderProps) {
  return (
    <header className="border-border bg-background/90 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={`/gor/${gorSlug}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {gorName}
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight sm:text-base"
        >
          {siteConfig.name}
        </Link>
      </div>
    </header>
  );
}
