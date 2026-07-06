/**
 * Sprint 16C — customer journey layout utilities
 */

export const customerLayout = {
  page: "px-4 py-8 sm:px-6 lg:py-10",
  pageWide: "px-4 py-8 sm:px-6 lg:py-12",
  container: "mx-auto max-w-3xl",
  containerWide: "mx-auto max-w-6xl",
  funnelStack: "flex flex-col gap-6 lg:gap-8",
  formStack: "space-y-6",
  formField: "space-y-2.5",
  formSection: "space-y-5",
  checkoutSection:
    "border-border bg-card space-y-5 rounded-[var(--radius-card-lg)] border p-6 sm:p-8",
  checkoutDivider: "border-border border-t pt-5",
  detailGrid: "grid gap-5 sm:grid-cols-2",
  heroHeight: "h-56 sm:h-72 md:h-80 lg:h-[22rem]",
  heroOverlay: "absolute inset-0 bg-black/30",
  heroGradient:
    "absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20",
} as const;
