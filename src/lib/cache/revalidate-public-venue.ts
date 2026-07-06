import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_VENUES_LIST_TAG = "public-venues-list";

export function publicVenueDetailTag(slug: string): string {
  return `public-venue:${slug}`;
}

export function revalidatePublicVenuePages(
  slug: string,
  previousSlug?: string | null,
): void {
  revalidatePath("/");
  revalidatePath(`/gor/${slug}`);
  revalidateTag(PUBLIC_VENUES_LIST_TAG);
  revalidateTag(publicVenueDetailTag(slug));

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/gor/${previousSlug}`);
    revalidateTag(publicVenueDetailTag(previousSlug));
  }

  revalidatePath("/gor", "layout");
}
