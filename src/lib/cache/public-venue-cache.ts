import { unstable_cache } from "next/cache";

import { getVenueService } from "@/domains/venue/actions/get-venue-service";
import type {
  PublicVenueData,
  PublicVenueListItem,
} from "@/domains/venue/types";
import {
  PUBLIC_VENUES_LIST_TAG,
  publicVenueDetailTag,
} from "@/lib/cache/revalidate-public-venue";

const PUBLIC_VENUE_REVALIDATE_SECONDS = 300;

export function getCachedActivePublicVenues(): Promise<PublicVenueListItem[]> {
  return unstable_cache(
    () => getVenueService().listActivePublicVenues(),
    ["active-public-venues"],
    {
      tags: [PUBLIC_VENUES_LIST_TAG],
      revalidate: PUBLIC_VENUE_REVALIDATE_SECONDS,
    },
  )();
}

export function getCachedPublicVenueDetail(
  slug: string,
): Promise<PublicVenueData> {
  return unstable_cache(
    () => getVenueService().getPublicVenueBySlug(slug),
    ["public-venue-detail", slug],
    {
      tags: [publicVenueDetailTag(slug), PUBLIC_VENUES_LIST_TAG],
      revalidate: PUBLIC_VENUE_REVALIDATE_SECONDS,
    },
  )();
}
