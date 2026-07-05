import type { MediaKind } from "@/domains/media/constants";

export function buildMediaStoragePath(
  ownerId: string,
  kind: MediaKind,
  fileId: string,
): string {
  return `${ownerId}/${kind}/${fileId}.webp`;
}
