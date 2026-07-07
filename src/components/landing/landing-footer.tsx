import Image from "next/image";
import Link from "next/link";

import { landingContent } from "@/config/landing";
import { layout } from "@/lib/design-system";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function LandingFooter() {
  const { footer } = landingContent;
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-muted/20 border-t">
      <div className={`${layout.container} px-4 py-16 sm:px-6 sm:py-20`}>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div className="max-w-sm space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/icon.png"
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]"
                aria-hidden
              />
              <span className="text-base font-bold tracking-tight">
                <span className="text-primary">Pesan</span>Lapangan
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {footer.tagline}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-tight">Tautan Cepat</p>
            <nav className="flex flex-col gap-3" aria-label="Navigasi footer">
              {footer.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-muted-foreground hover:text-foreground text-sm transition-colors duration-150",
                  )}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-tight">
              {footer.support.title}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {footer.support.description}
            </p>
            <a
              href={footer.support.emailHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm font-medium hover:underline"
            >
              {footer.support.emailLabel}
            </a>
          </div>
        </div>

        <div className="text-muted-foreground border-border mt-12 flex flex-col gap-2 border-t pt-8 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>
            © {year} {siteConfig.name}. {footer.copyright}
          </p>
          <p>Dibuat untuk komunitas olahraga Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
