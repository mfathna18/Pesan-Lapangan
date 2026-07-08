export function getVenueCoverImage(
  coverImageUrl: string | null | undefined,
): string | null {
  return coverImageUrl?.trim() ? coverImageUrl : null;
}
