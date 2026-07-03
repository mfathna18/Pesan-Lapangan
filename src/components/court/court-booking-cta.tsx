import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { customerLayout } from "@/lib/customer-layout";
import { cn } from "@/lib/utils";

type CourtBookingCtaProps = {
  bookingHref: string;
};

export function CourtBookingCta({ bookingHref }: CourtBookingCtaProps) {
  return (
    <section className="px-4 pb-16 sm:px-6">
      <div className={customerLayout.containerWide}>
        <div className="bg-primary text-primary-foreground rounded-[var(--radius-card-lg)] px-8 py-12 text-center sm:px-12 sm:py-14">
          <div className="mx-auto max-w-2xl space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Siap Memesan Lapangan?
            </h2>
            <p className="text-primary-foreground/85 text-base">
              Pilih tanggal dan waktu yang paling cocok, lalu lanjutkan ke
              pembayaran dengan mudah.
            </p>
            <Link
              href={bookingHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "inline-flex items-center gap-2",
              )}
            >
              <CalendarClock className="size-4" />
              {CUSTOMER_COPY.court.pickTimeCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
