import { Skeleton } from "@/components/ui/skeleton";
import { layout } from "@/lib/design-system";
import { pageLayout } from "@/lib/layout-system";

export function DashboardPageSkeleton() {
  return (
    <div className={layout.page} aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman dashboard...</span>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-11 w-36" />
      </div>

      <div className={pageLayout.statGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-border space-y-4 rounded-[var(--radius-card)] border p-6"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>

      <div className="border-border space-y-4 rounded-[var(--radius-card)] border p-6">
        <Skeleton className="h-5 w-40" />
        <TableSkeletonRows rows={5} columns={5} />
      </div>
    </div>
  );
}

type TableSkeletonRowsProps = {
  rows?: number;
  columns?: number;
};

export function TableSkeletonRows({
  rows = 5,
  columns = 5,
}: TableSkeletonRowsProps) {
  return (
    <div className="space-y-3">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`head-${index}`} className="h-4 w-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`${rowIndex}-${colIndex}`} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FilterCardSkeleton() {
  return (
    <div className="border-border space-y-5 rounded-[var(--radius-card)] border p-6">
      <Skeleton className="h-5 w-24" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4 w-full"
          style={{ maxWidth: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
