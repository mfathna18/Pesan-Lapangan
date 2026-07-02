/**
 * PesanLapangan Design System 1.0 — class-name utilities.
 * Tokens live in src/styles/design-tokens.css
 */

export const typography = {
  hero: "text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.08]",
  h1: "text-3xl font-semibold tracking-tight text-balance sm:text-4xl",
  h2: "text-2xl font-semibold tracking-tight text-balance sm:text-3xl",
  h3: "text-xl font-semibold tracking-tight sm:text-2xl",
  cardTitle: "text-base font-medium leading-snug",
  body: "text-sm leading-relaxed sm:text-base",
  bodySm: "text-sm leading-relaxed",
  caption: "text-xs leading-normal text-muted-foreground",
  eyebrow:
    "text-xs font-medium uppercase tracking-widest text-primary sm:text-sm",
} as const;

export const layout = {
  page: "flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8",
  pageNarrow: "mx-auto w-full max-w-3xl",
  section: "px-4 py-20 sm:px-6 sm:py-24 lg:py-28",
  container: "mx-auto max-w-6xl",
  sectionHeader: "mx-auto max-w-2xl space-y-4 text-center",
} as const;

export const radius = {
  button: "rounded-[var(--radius-button)]",
  card: "rounded-[var(--radius-card)]",
  input: "rounded-[var(--radius-input)]",
  dialog: "rounded-[var(--radius-dialog)]",
} as const;

export const shadow = {
  subtle: "shadow-[var(--shadow-subtle)]",
  card: "shadow-[var(--shadow-card)]",
  elevated: "shadow-[var(--shadow-elevated)]",
} as const;

/** Spacing scale (px): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 — use Tailwind gap/p/m utilities. */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;
