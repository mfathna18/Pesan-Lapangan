import Link from "next/link";

import { landingContent } from "@/config/landing";
import { siteConfig } from "@/config/site";
import { layout } from "@/lib/design-system";

export function LandingFooter() {
  const { footer } = landingContent;
  const year = new Date().getFullYear();

  return (
    <footer className="border-border border-t px-4 py-12 sm:px-6 sm:py-16">
      <div
        className={`${layout.container} flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between`}
      >
        <div className="max-w-sm space-y-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {footer.tagline}
          </p>
        </div>

        <nav
          className="flex flex-col gap-3 text-sm"
          aria-label="Navigasi footer"
        >
          {footer.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="text-muted-foreground border-border mx-auto mt-10 max-w-6xl border-t pt-6 text-xs sm:text-sm">
        © {year} {siteConfig.name}. {footer.copyright}
      </div>
    </footer>
  );
}
