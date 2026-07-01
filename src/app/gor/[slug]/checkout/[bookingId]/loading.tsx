import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`bg-muted animate-pulse rounded-md ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

export function CheckoutPageSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-border border-b px-4 py-4 sm:px-6">
        <Pulse className="h-6 w-40" />
      </div>
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="space-y-3">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-10 w-72 max-w-full" />
            <Pulse className="h-5 w-96 max-w-full" />
          </div>

          <Pulse className="h-28 w-full rounded-xl" />

          <Card>
            <CardHeader className="space-y-3">
              <Pulse className="h-7 w-48" />
              <Pulse className="h-4 w-64" />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Pulse className="h-4 w-20" />
                  <Pulse className="h-5 w-36" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutLoading() {
  return (
    <div aria-live="polite" aria-busy="true">
      <p className="sr-only">Memuat halaman pembayaran...</p>
      <CheckoutPageSkeleton />
    </div>
  );
}
