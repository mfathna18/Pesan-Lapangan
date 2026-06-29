import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CourtBookingCtaProps = {
  bookingHref: string;
};

export function CourtBookingCta({ bookingHref }: CourtBookingCtaProps) {
  return (
    <section className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="bg-primary text-primary-foreground rounded-3xl px-6 py-10 text-center sm:px-10">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Siap Memesan Lapangan?
            </h2>
            <p className="text-primary-foreground/85 text-sm sm:text-base">
              Pilih tanggal dan waktu booking yang sesuai untuk melanjutkan.
            </p>
            <Link
              href={bookingHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
              )}
            >
              <CalendarClock className="size-4" />
              Pilih Waktu Booking
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
