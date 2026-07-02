import Image from "next/image";
import Link from "next/link";

import { LandingHeaderActions } from "@/components/landing/landing-header-actions";
import { layout } from "@/lib/design-system";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#cari-lapangan", label: "Cari Lapangan" },
  { href: "#keunggulan", label: "Keunggulan" },
  { href: "#venue-populer", label: "Venue Populer" },
  { href: "#cara-kerja", label: "Cara Kerja" },
] as const;

export function LandingHeader() {
  return (
    <header className={layout.header}>
      <div className={layout.headerInner}>
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/icon.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]"
            priority
            aria-hidden
          />
          <span className="text-foreground text-base font-bold tracking-tight">
            <span className="text-primary">Pesan</span>Lapangan
          </span>
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
                "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200 motion-reduce:transition-none",
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
