import Link from "next/link";

import { landingContent } from "@/config/landing";
import { siteConfig } from "@/config/site";

export function LandingFooter() {
  const { footer } = landingContent;
  const year = new Date().getFullYear();

  return (
    <footer className="border-border border-t px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            {footer.tagline}
          </p>
        </div>

        <nav className="flex flex-col gap-3 text-sm">
          {footer.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="text-muted-foreground mx-auto mt-8 max-w-6xl border-t pt-6 text-xs sm:text-sm">
        © {year} {siteConfig.name}. {footer.copyright}
      </div>
    </footer>
  );
}
