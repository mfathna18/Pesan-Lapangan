const SLUG_MAX_LENGTH = 80;

export function generateSlugFromName(name: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH);

  return normalized || "gor";
}

export function resolveUniqueSlug(
  baseSlug: string,
  takenSlugs: Set<string>,
  excludeSlug?: string,
): string {
  if (!takenSlugs.has(baseSlug) || baseSlug === excludeSlug) {
    return baseSlug;
  }

  let counter = 2;

  while (counter < 1000) {
    const candidate = `${baseSlug}-${counter}`.slice(0, SLUG_MAX_LENGTH);

    if (!takenSlugs.has(candidate) || candidate === excludeSlug) {
      return candidate;
    }

    counter += 1;
  }

  return `${baseSlug}-${Date.now()}`.slice(0, SLUG_MAX_LENGTH);
}
