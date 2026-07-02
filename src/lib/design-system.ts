/**
 * PesanLapangan Design System — class-name utilities.
 * Tokens: src/styles/design-tokens.css
 */

export const typography = {
  hero: "text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]",
  h1: "text-4xl font-bold tracking-tight text-balance",
  h2: "text-3xl font-semibold tracking-tight text-balance",
  h3: "text-2xl font-semibold tracking-tight",
  cardTitle: "text-base font-semibold leading-snug",
  body: "text-base leading-relaxed",
  bodySm: "text-sm leading-relaxed",
  caption: "text-sm leading-normal text-muted-foreground",
  label: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
  stat: "text-3xl font-bold tracking-tight tabular-nums",
  eyebrow:
    "text-xs font-semibold uppercase tracking-widest text-primary sm:text-sm",
} as const;

export const layout = {
  page: "flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8",
  pageNarrow: "mx-auto w-full max-w-3xl",
  section: "px-4 py-20 sm:px-6 sm:py-24 lg:py-28",
  sectionCompact: "px-4 py-16 sm:px-6 sm:py-20",
  container: "mx-auto max-w-6xl",
  sectionHeader: "mx-auto max-w-2xl space-y-4 text-center",
} as const;

export const radius = {
  button: "rounded-[var(--radius-button)]",
  card: "rounded-[var(--radius-card)]",
  cardLg: "rounded-[var(--radius-card-lg)]",
  input: "rounded-[var(--radius-input)]",
  dialog: "rounded-[var(--radius-dialog)]",
  pill: "rounded-[var(--radius-pill)]",
} as const;

export const shadow = {
  subtle: "shadow-[var(--shadow-subtle)]",
  card: "shadow-[var(--shadow-card)]",
  elevated: "shadow-[var(--shadow-elevated)]",
} as const;

/** 8px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 */
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
