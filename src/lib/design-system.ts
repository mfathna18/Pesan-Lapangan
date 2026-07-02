/**
 * PesanLapangan Production Design System 1.0 — utilities
 * Tokens: src/styles/design-tokens.css
 */

export const typography = {
  hero: "text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]",
  h1: "text-4xl font-bold tracking-tight text-balance",
  h2: "text-3xl font-semibold tracking-tight text-balance",
  h3: "text-2xl font-semibold tracking-tight",
  cardTitle: "text-base font-semibold leading-snug tracking-tight",
  body: "text-base leading-relaxed",
  bodySm: "text-sm leading-relaxed",
  caption: "text-sm leading-normal text-muted-foreground",
  label: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
  stat: "text-3xl font-bold tracking-tight tabular-nums",
  eyebrow:
    "text-xs font-semibold uppercase tracking-widest text-primary sm:text-sm",
} as const;

export const layout = {
  page: "flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:gap-10 lg:p-8",
  pageNarrow: "mx-auto w-full max-w-3xl",
  section: "px-4 py-20 sm:px-6 sm:py-24 lg:py-28",
  sectionCompact: "px-4 py-16 sm:px-6 sm:py-20",
  container: "mx-auto max-w-6xl",
  sectionHeader: "mx-auto max-w-2xl space-y-4 text-center",
  header:
    "sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md",
  headerInner:
    "mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6",
} as const;

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const transition =
  "transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

export const radius = {
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  xl: "rounded-[var(--radius-xl)]",
  button: "rounded-[var(--radius-button)]",
  card: "rounded-[var(--radius-card)]",
  cardLg: "rounded-[var(--radius-card-lg)]",
  input: "rounded-[var(--radius-input)]",
  dialog: "rounded-[var(--radius-dialog)]",
  pill: "rounded-[var(--radius-pill)]",
} as const;

export const shadow = {
  sm: "shadow-[var(--shadow-sm)]",
  md: "shadow-[var(--shadow-md)]",
  lg: "shadow-[var(--shadow-lg)]",
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
