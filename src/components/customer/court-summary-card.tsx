import Link from "next/link";
import { CalendarClock, Clock, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CustomerDetailField } from "@/components/customer/customer-detail-field";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { customerLayout } from "@/lib/customer-layout";
import { formatCurrency } from "@/domains/booking/utils/booking-display";
import type { PublicCourtDetailData } from "@/domains/booking/types";
import { cn } from "@/lib/utils";

type CourtSummaryCardProps = {
  court: PublicCourtDetailData;
  bookingHref: string;
};

function getAvailabilitySummary(
  openHours: PublicCourtDetailData["openHours"],
): string {
  const openDays = openHours.filter((day) => day.hours !== "Tutup");

  if (openDays.length === 0) {
    return "Jadwal belum tersedia";
  }

  return `Buka ${openDays.length} hari dalam seminggu`;
}

export function CourtSummaryCard({
  court,
  bookingHref,
}: CourtSummaryCardProps) {
  const availabilitySummary = getAvailabilitySummary(court.openHours);

  return (
    <section className="px-4 sm:px-6">
      <div className={customerLayout.containerWide}>
        <div className={customerLayout.checkoutSection}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{court.sportLabel}</Badge>
                <Badge variant="secondary">{availabilitySummary}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
                  {CUSTOMER_COPY.court.eyebrow}
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  {court.name}
                </h1>
                {court.description ? (
                  <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
                    {court.description}
                  </p>
                ) : null}
              </div>
            </div>

            <Link
              href={bookingHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex w-full shrink-0 items-center gap-2 lg:w-auto",
              )}
            >
              <CalendarClock className="size-4" />
              {CUSTOMER_COPY.court.bookCta}
            </Link>
          </div>

          <div
            className={`${customerLayout.checkoutDivider} ${customerLayout.detailGrid}`}
          >
            {court.startingPrice != null ? (
              <CustomerDetailField
                label={CUSTOMER_COPY.court.priceTitle}
                value={`${formatCurrency(court.startingPrice)}${CUSTOMER_COPY.court.pricePerHour}`}
                emphasis
              />
            ) : (
              <div className="flex items-start gap-3">
                <Tags
                  className="text-muted-foreground mt-0.5 size-4"
                  aria-hidden
                />
                <div>
                  <p className="text-muted-foreground text-sm">Harga</p>
                  <p className="font-medium">Hubungi venue untuk info harga</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock
                className="text-muted-foreground mt-0.5 size-4"
                aria-hidden
              />
              <div>
                <p className="text-muted-foreground text-sm">Ketersediaan</p>
                <p className="font-medium">{availabilitySummary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
