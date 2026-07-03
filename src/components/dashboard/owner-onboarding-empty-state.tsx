import Link from "next/link";
import { CalendarDays, LayoutDashboard, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type OwnerOnboardingEmptyStateProps = {
  title?: string;
  description?: string;
};

export function OwnerOnboardingEmptyState({
  title = "Belum ada booking",
  description = "Dashboard operasional akan menampilkan ringkasan booking, pendapatan, dan aktivitas terbaru setelah pelanggan pertama kali melakukan booking di venue Anda.",
}: OwnerOnboardingEmptyStateProps) {
  return (
    <EmptyState
      icon={LayoutDashboard}
      title={title}
      description={description}
      tips={
        <>
          <p>Langkah awal yang bisa Anda lakukan:</p>
          <ul className="mt-2 space-y-1 text-left">
            <li>• Pastikan lapangan sudah aktif dan siap dipesan.</li>
            <li>• Atur jam operasional agar slot booking tersedia.</li>
            <li>• Bagikan link venue kepada pelanggan.</li>
          </ul>
        </>
      }
      action={
        <Link
          href="/dashboard/courts"
          className={buttonVariants({
            className: "inline-flex items-center gap-2",
          })}
        >
          <MapPin className="size-4" />
          Kelola Lapangan
        </Link>
      }
      secondaryAction={
        <Link
          href="/dashboard/bookings"
          className={buttonVariants({
            variant: "outline",
            className: "inline-flex items-center gap-2",
          })}
        >
          <CalendarDays className="size-4" />
          Lihat Booking
        </Link>
      }
    />
  );
}
