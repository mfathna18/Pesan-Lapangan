import type { PublicGorRecord } from "@/domains/owner/types";

export function getPrimaryCoverImage(
  coverImages: string[] | null | undefined,
): string | null {
  return coverImages?.[0] ?? null;
}

export function mapPublicGorCoverImage(
  gor: Pick<PublicGorRecord, "coverImages">,
): string | null {
  return getPrimaryCoverImage(gor.coverImages);
}
