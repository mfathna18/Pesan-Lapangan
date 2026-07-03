/**
 * Sprint 16B — layout-only utilities (does not modify design tokens)
 */

export const dashboardLayout = {
  sidebarWidth: "17.5rem",
  sidebarCollapsedWidth: "4.5rem",
  sidebarExpandedClass: "w-[17.5rem]",
  sidebarCollapsedClass: "w-[4.5rem]",
  mainOffsetExpanded: "lg:pl-[17.5rem]",
  mainOffsetCollapsed: "lg:pl-[4.5rem]",
} as const;

export const pageLayout = {
  filterGrid: "grid gap-5 md:grid-cols-2 xl:grid-cols-5",
  filterGridTwoCol: "grid gap-5 sm:grid-cols-2",
  cardStack: "flex flex-col gap-6 lg:gap-8",
  statGrid: "grid gap-5 sm:grid-cols-2 xl:grid-cols-4",
  tableWrap: "space-y-5",
} as const;

export const landingLayout = {
  hero: "px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24",
  section: "px-4 py-20 sm:px-6 sm:py-24 lg:py-28",
  sectionAlt: "px-4 py-20 sm:px-6 sm:py-24 lg:py-28",
  sectionDivider: "border-border/60 border-t",
  searchCard:
    "rounded-[var(--radius-card-lg)] border border-border bg-card p-2 shadow-[var(--shadow-sm)] sm:p-3",
} as const;
