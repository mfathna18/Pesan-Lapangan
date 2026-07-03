import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { customerLayout } from "@/lib/customer-layout";

export function CustomerFunnelSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-border border-b px-4 py-4 sm:px-6">
        <Skeleton className="h-6 w-40" />
      </div>
      <main className={customerLayout.page}>
        <div
          className={`${customerLayout.container} ${customerLayout.funnelStack}`}
        >
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-72 max-w-full" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>

          <Skeleton className="h-28 w-full rounded-[var(--radius-card-lg)]" />

          <Card>
            <CardHeader className="space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className={customerLayout.detailGrid}>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-36" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Skeleton className="h-14 w-full rounded-[var(--radius-button)]" />
        </div>
      </main>
    </div>
  );
}
