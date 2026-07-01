"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { AvailabilitySlotGrid } from "@/components/availability/availability-slot-grid";
import {
  BookingRangeSummary,
  formatBookingDateLabel,
} from "@/components/booking/booking-range-summary";
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
  isSlotWithinBookingRange,
  resolveRangeLineItems,
  resolveRangeTotalPrice,
} from "@/domains/booking/utils/booking-range";
import { cn } from "@/lib/utils";

type CourtAvailabilityContext = {
  gorSlug: string;
  gorName: string;
  courtId: string;
  courtName: string;
  sportLabel: string;
};

type CourtAvailabilityBookingProps = {
  court: CourtAvailabilityContext;
};

const RANGE_UNAVAILABLE_MESSAGE =
  "Rentang waktu tidak valid. Semua jam di antara mulai dan selesai harus tersedia.";

export function CourtAvailabilityBooking({
  court,
}: CourtAvailabilityBookingProps) {
  const [bookingDate, setBookingDate] = useState(getTodayDateInputValue);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [rangeStartMinute, setRangeStartMinute] = useState<number | null>(null);
  const [rangeEndMinute, setRangeEndMinute] = useState<number | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  const lineItems = useMemo(() => {
    if (rangeStartMinute === null || rangeEndMinute === null) {
      return null;
    }

    return resolveRangeLineItems(slots, rangeStartMinute, rangeEndMinute);
  }, [rangeEndMinute, rangeStartMinute, slots]);

  const totalPrice = useMemo(() => {
    if (!lineItems) {
      return null;
    }

    return lineItems.reduce((total, item) => total + item.price, 0);
  }, [lineItems]);

  const isRangeComplete = lineItems !== null && totalPrice !== null;

  const loadSlots = useCallback(() => {
    startTransition(async () => {
      setError(null);

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

  useEffect(() => {
    if (rangeStartMinute === null || rangeEndMinute === null) {
      return;
    }

    if (
      resolveRangeTotalPrice(slots, rangeStartMinute, rangeEndMinute) === null
    ) {
      setRangeStartMinute(null);
      setRangeEndMinute(null);
      setRangeError(RANGE_UNAVAILABLE_MESSAGE);
    }
  }, [rangeEndMinute, rangeStartMinute, slots]);

  useEffect(() => {
    setRangeStartMinute(null);
    setRangeEndMinute(null);
    setRangeError(null);
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    function handleFocus() {
      loadSlots();
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadSlots]);

  function clearRangeSelection() {
    setRangeStartMinute(null);
    setRangeEndMinute(null);
    setRangeError(null);
  }

  function handleSelectSlot(slot: AvailabilitySlot) {
    if (!slot.available) {
      return;
    }

    setRangeError(null);

    if (rangeStartMinute === null) {
      setRangeStartMinute(slot.startMinute);
      setRangeEndMinute(slot.endMinute);
      return;
    }

    if (
      rangeStartMinute === slot.startMinute &&
      rangeEndMinute === slot.endMinute
    ) {
      clearRangeSelection();
      return;
    }

    if (slot.startMinute < rangeStartMinute) {
      setRangeStartMinute(slot.startMinute);
      setRangeEndMinute(slot.endMinute);
      return;
    }

    if (
      slot.startMinute === rangeStartMinute &&
      rangeEndMinute !== null &&
      rangeEndMinute > slot.endMinute
    ) {
      setRangeEndMinute(slot.endMinute);
      return;
    }

    if (slot.endMinute <= rangeStartMinute) {
      setRangeError("Waktu selesai harus setelah waktu mulai.");
      return;
    }

    if (
      resolveRangeTotalPrice(slots, rangeStartMinute, slot.endMinute) === null
    ) {
      setRangeError(RANGE_UNAVAILABLE_MESSAGE);
      return;
    }

    setRangeEndMinute(slot.endMinute);
  }

  const bookingDateLabel = formatBookingDateLabel(bookingDate);
  const formHref =
    isRangeComplete && rangeStartMinute !== null && rangeEndMinute !== null
      ? `/gor/${court.gorSlug}/court/${court.courtId}/booking/form?${new URLSearchParams(
          {
            date: bookingDate,
            startMinute: String(rangeStartMinute),
            endMinute: String(rangeEndMinute),
            price: String(totalPrice),
          },
        ).toString()}`
      : null;

  return (
    <div className="bg-background min-h-screen pb-40">
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
                Pilih tanggal, lalu klik slot untuk booking 1 jam. Klik slot
                berikutnya untuk memperpanjang rentang.
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

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Rentang Waktu</CardTitle>
                  <CardDescription>
                    {isRangeComplete
                      ? "Klik slot berikutnya untuk memperpanjang, slot sebelumnya untuk memperpendek, atau Atur ulang untuk memulai ulang."
                      : "Klik slot tersedia untuk memilih booking 1 jam."}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadSlots}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn(isLoading && "animate-spin")} />
                  Muat Ulang
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {error ? (
                  <p className="text-destructive text-sm" role="alert">
                    {error}
                  </p>
                ) : null}

                {rangeError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {rangeError}
                  </p>
                ) : null}

                <AvailabilitySlotGrid
                  slots={slots}
                  selectedStartMinute={rangeStartMinute}
                  selectedEndMinute={rangeEndMinute}
                  isSlotInSelectedRange={(slot) =>
                    rangeStartMinute !== null &&
                    rangeEndMinute !== null &&
                    isSlotWithinBookingRange(
                      slot,
                      rangeStartMinute,
                      rangeEndMinute,
                    )
                  }
                  onSelectSlot={handleSelectSlot}
                  isLoading={isLoading}
                  emptyMessage="Tidak ada slot untuk tanggal ini."
                />

                {rangeStartMinute !== null ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearRangeSelection}
                  >
                    Atur Ulang Pilihan
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <BookingRangeSummary
              courtName={court.courtName}
              bookingDateLabel={bookingDateLabel}
              startMinute={rangeStartMinute}
              endMinute={rangeEndMinute}
              lineItems={lineItems}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      </main>

      <div className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 text-sm">
            <p className="text-muted-foreground">Ringkasan</p>
            <p className="truncate font-medium">
              {isRangeComplete &&
              rangeStartMinute !== null &&
              rangeEndMinute !== null
                ? `${court.courtName} · ${bookingDateLabel}`
                : "Pilih slot waktu untuk memulai"}
            </p>
          </div>

          {formHref ? (
            <Link
              href={formHref}
              className={cn(buttonVariants({ size: "lg" }), "shrink-0")}
            >
              Isi Data Booking
            </Link>
          ) : (
            <Button type="button" size="lg" disabled className="shrink-0">
              Isi Data Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
