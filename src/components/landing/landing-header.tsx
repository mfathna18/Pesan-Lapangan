import Link from "next/link";

import { LandingHeaderActions } from "@/components/landing/landing-header-actions";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#cari-lapangan", label: "Cari Lapangan" },
  { href: "#keunggulan", label: "Keunggulan" },
  { href: "#venue-populer", label: "Venue Populer" },
  { href: "#cara-kerja", label: "Cara Kerja" },
] as const;

export function LandingHeader() {
  return (
    <header className="border-border/80 bg-background/90 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6">
        <Link
          href="/"
          className="text-foreground shrink-0 text-base font-bold tracking-tight"
        >
          <span className="text-primary">Pesan</span>Lapangan
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navigasi utama"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-150",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <LandingHeaderActions />
      </div>
    </header>
  );
}
