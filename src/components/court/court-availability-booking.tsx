"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { getTodayDateInputValue } from "@/components/booking/booking-form.utils";
import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCourtAvailabilityAction } from "@/domains/availability/actions/get-court-availability.action";
import type { AvailabilitySlot } from "@/domains/availability/types";
import {
  formatBookingDate,
  formatCurrency,
  formatMinuteOfDay,
} from "@/domains/booking/utils/booking-display";
import { cn } from "@/lib/utils";

type CourtAvailabilityContext = {
  gorSlug: string;
  gorName: string;
  courtId: string;
  courtName: string;
  sportLabel: string;
};

type SelectedSlot = {
  startMinute: number;
  endMinute: number;
  price: number;
};

type CourtAvailabilityBookingProps = {
  court: CourtAvailabilityContext;
};

function formatSlotTimeRange(
  slot: Pick<SelectedSlot, "startMinute" | "endMinute">,
) {
  return `${formatMinuteOfDay(slot.startMinute)} - ${formatMinuteOfDay(slot.endMinute)}`;
}

function isSameSlot(left: SelectedSlot, right: SelectedSlot) {
  return (
    left.startMinute === right.startMinute && left.endMinute === right.endMinute
  );
}

export function CourtAvailabilityBooking({
  court,
}: CourtAvailabilityBookingProps) {
  const [bookingDate, setBookingDate] = useState(getTodayDateInputValue);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setError(null);
      setSelectedSlot(null);

      const response = await getCourtAvailabilityAction({
        gorSlug: court.gorSlug,
        courtId: court.courtId,
        bookingDate,
      });

      if (!response.success) {
        setSlots([]);
        setError(response.error);
        return;
      }

      setSlots(response.data);
    });
  }, [bookingDate, court.courtId, court.gorSlug]);

  function handleSelectSlot(slot: AvailabilitySlot) {
    if (!slot.available) {
      return;
    }

    const nextSlot: SelectedSlot = {
      startMinute: slot.startMinute,
      endMinute: slot.endMinute,
      price: slot.price,
    };

    setSelectedSlot((current) =>
      current && isSameSlot(current, nextSlot) ? null : nextSlot,
    );
  }

  const selectedDateLabel = formatBookingDate(
    new Date(`${bookingDate}T00:00:00`),
  );
  const formHref =
    selectedSlot != null
      ? `/gor/${court.gorSlug}/court/${court.courtId}/booking/form?${new URLSearchParams(
          {
            date: bookingDate,
            startMinute: String(selectedSlot.startMinute),
            endMinute: String(selectedSlot.endMinute),
            price: String(selectedSlot.price),
          },
        ).toString()}`
      : null;

  return (
    <div className="bg-background min-h-screen pb-32">
      <CourtDetailHeader gorSlug={court.gorSlug} gorName={court.gorName} />
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              Pilih Waktu
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {court.courtName}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {court.sportLabel} · {court.gorName}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tanggal Booking</CardTitle>
              <CardDescription>
                Pilih tanggal untuk melihat slot waktu yang tersedia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs space-y-2">
                <Label htmlFor="booking-date">Tanggal</Label>
                <Input
                  id="booking-date"
                  type="date"
                  min={getTodayDateInputValue()}
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slot Waktu</CardTitle>
              <CardDescription>
                Pilih satu slot yang tersedia. Slot penuh ditampilkan nonaktif.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              ) : null}

              {isLoading ? (
                <p className="text-muted-foreground text-sm">
                  Memuat ketersediaan...
                </p>
              ) : null}

              {!isLoading && !error && slots.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Tidak ada slot untuk tanggal ini.
                </p>
              ) : null}

              {!isLoading && slots.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {slots.map((slot) => {
                    const isSelected =
                      selectedSlot != null &&
                      selectedSlot.startMinute === slot.startMinute &&
                      selectedSlot.endMinute === slot.endMinute;

                    return (
                      <button
                        key={`${slot.startMinute}-${slot.endMinute}`}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => handleSelectSlot(slot)}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-colors",
                          slot.available
                            ? "hover:border-primary/60 hover:bg-muted/40 cursor-pointer"
                            : "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60",
                          isSelected &&
                            "border-primary bg-primary/5 ring-primary ring-2",
                        )}
                      >
                        <p className="font-medium">
                          {formatSlotTimeRange(slot)}
                        </p>
                        <p className="mt-1 text-sm">
                          {formatCurrency(slot.price)}
                        </p>
                        <p
                          className={cn(
                            "mt-2 text-xs font-medium",
                            slot.available
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground",
                          )}
                        >
                          {slot.available ? "Tersedia" : "Penuh"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="grid gap-1 text-sm sm:grid-cols-3 sm:gap-6">
            <div>
              <p className="text-muted-foreground">Tanggal</p>
              <p className="font-medium">{selectedDateLabel}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Waktu</p>
              <p className="font-medium">
                {selectedSlot
                  ? formatSlotTimeRange(selectedSlot)
                  : "Belum dipilih"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimasi Harga</p>
              <p className="font-medium">
                {selectedSlot ? formatCurrency(selectedSlot.price) : "-"}
              </p>
            </div>
          </div>

          {formHref ? (
            <Link
              href={formHref}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Lanjutkan
            </Link>
          ) : (
            <Button type="button" size="lg" disabled>
              Lanjutkan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
