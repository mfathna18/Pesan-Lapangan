import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export function createPageMetadata(
  title: string,
  description?: string,
): Metadata {
  const pageDescription = description ?? siteConfig.description;

  return {
    title,
    description: pageDescription,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: pageDescription,
      siteName: siteConfig.name,
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description: pageDescription,
    },
  };
}
