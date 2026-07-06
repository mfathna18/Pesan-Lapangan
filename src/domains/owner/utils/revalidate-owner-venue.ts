import { getGorProfileService } from "@/domains/owner/actions/get-gor-profile-service";
import { createGorRepository } from "@/domains/owner/repositories/gor-repository";
import { OwnerNotFoundError } from "@/domains/owner/errors";
import { revalidatePublicVenuePages } from "@/lib/cache/revalidate-public-venue";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function revalidatePublicVenueForUserId(
  userId: string,
  previousSlug?: string | null,
): Promise<void> {
  try {
    const profile = await getGorProfileService().getForUser(userId);

    if (profile?.slug) {
      revalidatePublicVenuePages(profile.slug, previousSlug);
      return;
    }
  } catch (error) {
    if (!(error instanceof OwnerNotFoundError)) {
      throw error;
    }
  }

  revalidatePath("/");
}

export async function revalidatePublicVenueForOwnerId(
  ownerId: string,
): Promise<void> {
  const slug = await createGorRepository(prisma).findSlugByOwnerId(ownerId);

  if (slug) {
    revalidatePublicVenuePages(slug);
    return;
  }

  revalidatePath("/");
}
