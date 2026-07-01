import Link from "next/link";
import { CalendarDays, LayoutDashboard, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type OwnerOnboardingEmptyStateProps = {
  title?: string;
  description?: string;
};

export function OwnerOnboardingEmptyState({
  title = "Belum ada booking",
  description = "Dashboard operasional akan menampilkan ringkasan booking, pendapatan, dan aktivitas terbaru setelah pelanggan pertama kali melakukan booking di venue Anda.",
}: OwnerOnboardingEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="bg-muted flex size-16 items-center justify-center rounded-full">
          <LayoutDashboard className="text-muted-foreground size-8" />
        </div>

        <div className="max-w-lg space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        <div className="text-muted-foreground max-w-md space-y-2 text-sm">
          <p>Langkah awal yang bisa Anda lakukan:</p>
          <ul className="space-y-1 text-left">
            <li>• Pastikan lapangan sudah aktif dan siap dipesan.</li>
            <li>• Atur jam operasional agar slot booking tersedia.</li>
            <li>• Bagikan link venue kepada pelanggan.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/courts"
            className={cn(buttonVariants(), "inline-flex items-center gap-2")}
          >
            <MapPin className="size-4" />
            Kelola Lapangan
          </Link>
          <Link
            href="/dashboard/bookings"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex items-center gap-2",
            )}
          >
            <CalendarDays className="size-4" />
            Lihat Booking
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
