import { revalidatePath } from "next/cache";

export function revalidatePublicVenuePages(
  slug: string,
  previousSlug?: string | null,
): void {
  revalidatePath("/");
  revalidatePath(`/gor/${slug}`);

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/gor/${previousSlug}`);
  }

  revalidatePath("/gor", "layout");
}
