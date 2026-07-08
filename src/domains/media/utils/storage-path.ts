import type { MediaKind } from "@/domains/media/constants";
import { MEDIA_KIND } from "@/domains/media/constants";

export function buildMediaStoragePath(
  ownerId: string,
  kind: MediaKind,
  fileId: string,
  courtId?: string,
): string {
  if (kind === MEDIA_KIND.COURT) {
    if (!courtId) {
      throw new Error("courtId is required for court image storage paths.");
    }

    return `${ownerId}/${courtId}/${fileId}.webp`;
  }

  return `${ownerId}/${kind}/${fileId}.webp`;
}
