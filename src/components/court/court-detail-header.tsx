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
    <header className="border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={`/gor/${gorSlug}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          {gorName}
        </Link>
        <Link href="/" className="font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
      </div>
    </header>
  );
}
