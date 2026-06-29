import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CourtBookingNotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Booking Tidak Tersedia
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Halaman booking untuk lapangan ini tidak ditemukan atau sudah tidak
          aktif.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
