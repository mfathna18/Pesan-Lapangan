"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { AvailabilitySlotGrid } from "@/components/availability/availability-slot-grid";
import { getTodayDateInputValue } from "@/components/booking/booking-form.utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOwnerCourtAvailabilityAction } from "@/domains/availability/actions/get-owner-court-availability.action";
import type { AvailabilitySlot } from "@/domains/availability/types";
import { listCourtsAction } from "@/domains/booking/actions/list-courts.action";
import type { OwnerCourtListItem } from "@/domains/booking/types";
import { UI_COPY } from "@/config/ui-copy";
import { cn } from "@/lib/utils";

type OwnerAvailabilityVerificationProps = {
  gorSlug: string | null;
};

export function OwnerAvailabilityVerification({
  gorSlug,
}: OwnerAvailabilityVerificationProps) {
  const [courts, setCourts] = useState<OwnerCourtListItem[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const [bookingDate, setBookingDate] = useState(getTodayDateInputValue);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [courtsError, setCourtsError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [isLoadingCourts, startCourtsTransition] = useTransition();
  const [isLoadingSlots, startSlotsTransition] = useTransition();

  const selectedCourt = courts.find((court) => court.id === selectedCourtId);

  const loadSlots = useCallback(() => {
    if (!selectedCourtId) {
      setSlots([]);
      return;
    }

    startSlotsTransition(async () => {
      setSlotsError(null);

      const response = await getOwnerCourtAvailabilityAction({
        courtId: selectedCourtId,
        bookingDate,
      });

      if (!response.success) {
        setSlots([]);
        setSlotsError(response.error);
        return;
      }

      setSlots(response.data);
    });
  }, [bookingDate, selectedCourtId]);

  useEffect(() => {
    startCourtsTransition(async () => {
      setCourtsError(null);

      const response = await listCourtsAction();

      if (!response.success) {
        setCourtsError(response.error);
        setCourts([]);
        return;
      }

      setCourts(response.data);

      if (response.data.length > 0) {
        setSelectedCourtId((current) => current || response.data[0]?.id || "");
      }
    });
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    function handleFocus() {
      loadSlots();
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadSlots]);

  const publicBookingHref =
    gorSlug && selectedCourtId
      ? `/gor/${gorSlug}/court/${selectedCourtId}/booking`
      : null;

  const isBusy = isLoadingCourts || isLoadingSlots;

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ketersediaan
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Verifikasi ketersediaan slot setelah mengatur jam operasional dan
            harga.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadSlots}
            disabled={!selectedCourtId || isBusy}
          >
            <RefreshCw className={cn(isLoadingSlots && "animate-spin")} />
            {UI_COPY.refresh}
          </Button>
          {publicBookingHref ? (
            <Link
              href={publicBookingHref}
              className={cn(buttonVariants({ variant: "default" }))}
              target="_blank"
              rel="noreferrer"
            >
              Buka Booking Publik
            </Link>
          ) : null}
        </div>
      </div>

      {courtsError ? (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
        >
          {courtsError}
        </p>
      ) : null}

      {courts.length === 0 && !isLoadingCourts ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Tambahkan lapangan, jam operasional, dan harga sebelum
              memverifikasi ketersediaan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pilih Lapangan &amp; Tanggal</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="availability-court">{UI_COPY.court}</Label>
                <Select
                  value={selectedCourtId}
                  onValueChange={(value) =>
                    setSelectedCourtId(value ?? selectedCourtId)
                  }
                  disabled={isBusy || courts.length === 0}
                >
                  <SelectTrigger id="availability-court" className="w-full">
                    <SelectValue placeholder={UI_COPY.selectCourt}>
                      {() => selectedCourt?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability-date">Tanggal</Label>
                <Input
                  id="availability-date"
                  type="date"
                  min={getTodayDateInputValue()}
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                  disabled={isBusy}
                />
              </div>
            </CardContent>
          </Card>

          {slotsError ? (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
            >
              {slotsError}
            </p>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCourt
                  ? `Grid Ketersediaan — ${selectedCourt.name}`
                  : "Grid Ketersediaan"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AvailabilitySlotGrid
                slots={slots}
                isLoading={isLoadingSlots}
                emptyMessage="Tidak ada slot untuk tanggal ini. Periksa jam operasional dan aturan harga."
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
