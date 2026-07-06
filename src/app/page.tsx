import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { LandingPage } from "@/components/landing/landing-page";
import { siteConfig } from "@/config/site";
import { getVenueService } from "@/domains/venue/actions/get-venue-service";

export const metadata: Metadata = {
  title: "Pesan Lapangan Olahraga Online",
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: `${siteConfig.name} | Pesan Lapangan Olahraga Online`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Pesan Lapangan Olahraga Online`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  noStore();

  const venues = await getVenueService().listActivePublicVenues();

  return <LandingPage venues={venues} />;
}
