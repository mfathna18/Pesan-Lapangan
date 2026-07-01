"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";

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
import { getOperatingHoursAction } from "@/domains/availability/actions/get-operating-hours.action";
import { saveOperatingHoursAction } from "@/domains/availability/actions/save-operating-hours.action";
import { OPERATING_HOURS_WEEKDAYS } from "@/domains/availability/constants";
import type { OwnerOperatingHoursDaySchedule } from "@/domains/availability/types";
import { listCourtsAction } from "@/domains/booking/actions/list-courts.action";
import type { OwnerCourtListItem } from "@/domains/booking/types";
import { UI_COPY } from "@/config/ui-copy";
import { cn } from "@/lib/utils";

type DayFormState = OwnerOperatingHoursDaySchedule;

function createDefaultDays(): DayFormState[] {
  return OPERATING_HOURS_WEEKDAYS.map(({ dayOfWeek, label }) => ({
    dayOfWeek,
    label,
    enabled: false,
    startTime: "08:00",
    endTime: "22:00",
  }));
}

export function OperatingHoursManagement() {
  const [courts, setCourts] = useState<OwnerCourtListItem[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [days, setDays] = useState<DayFormState[]>(createDefaultDays);
  const [courtsError, setCourtsError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isLoadingCourts, startCourtsTransition] = useTransition();
  const [isLoadingHours, startHoursTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const loadCourts = useCallback(() => {
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

  const loadOperatingHours = useCallback((courtId: string) => {
    if (!courtId) {
      setDays(createDefaultDays());
      return;
    }

    startHoursTransition(async () => {
      setLoadError(null);
      setSaveSuccess(null);

      const response = await getOperatingHoursAction({ courtId });

      if (!response.success) {
        setLoadError(response.error);
        setDays(createDefaultDays());
        return;
      }

      setDays(response.data.days);
    });
  }, []);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  useEffect(() => {
    if (selectedCourtId) {
      loadOperatingHours(selectedCourtId);
    }
  }, [selectedCourtId, loadOperatingHours]);

  function updateDay(
    dayOfWeek: number,
    updates: Partial<Pick<DayFormState, "enabled" | "startTime" | "endTime">>,
  ) {
    setDays((current) =>
      current.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day,
      ),
    );
    setSaveSuccess(null);
  }

  function handleSave() {
    if (!selectedCourtId) {
      return;
    }

    setSaveError(null);
    setSaveSuccess(null);

    startSaveTransition(async () => {
      const response = await saveOperatingHoursAction({
        courtId: selectedCourtId,
        days: days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          enabled: day.enabled,
          startTime: day.startTime,
          endTime: day.endTime,
        })),
      });

      if (!response.success) {
        setSaveError(response.error);
        return;
      }

      setDays(response.data.days);
      setSaveSuccess("Jam operasional berhasil disimpan.");
    });
  }

  const isBusy = isLoadingCourts || isLoadingHours || isSaving;
  const selectedCourt = courts.find((court) => court.id === selectedCourtId);

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Jam Operasional
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Atur jam operasional lapangan venue kamu.
          </p>
        </div>

        <Button onClick={handleSave} disabled={!selectedCourtId || isBusy}>
          {isSaving ? UI_COPY.saving : UI_COPY.save}
        </Button>
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
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Minimal satu lapangan diperlukan sebelum mengatur jam operasional.
            </p>
            <Link
              href="/dashboard/courts"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Ke Halaman Lapangan
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pilih Lapangan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-2">
                <Label htmlFor="operating-hours-court">{UI_COPY.court}</Label>
                <Select
                  value={selectedCourtId}
                  onValueChange={(value) =>
                    setSelectedCourtId(value ?? selectedCourtId)
                  }
                  disabled={isBusy || courts.length === 0}
                >
                  <SelectTrigger id="operating-hours-court" className="w-full">
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
                {selectedCourt ? (
                  <p className="text-muted-foreground text-sm">
                    Mengubah jam operasional untuk {selectedCourt.name}.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {loadError ? (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
            >
              {loadError}
            </p>
          ) : null}

          {saveError ? (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
            >
              {saveError}
            </p>
          ) : null}

          {saveSuccess ? (
            <p
              role="status"
              className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
            >
              {saveSuccess}
            </p>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCourt
                  ? `Jadwal Mingguan — ${selectedCourt.name}`
                  : "Jadwal Mingguan"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingHours && days.every((day) => !day.enabled) ? (
                <p className="text-muted-foreground text-sm">
                  Memuat jam operasional...
                </p>
              ) : null}

              {days.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className="border-border grid gap-4 rounded-lg border p-4 md:grid-cols-[160px_120px_1fr_1fr]"
                >
                  <div className="flex items-center gap-3">
                    <input
                      id={`day-enabled-${day.dayOfWeek}`}
                      type="checkbox"
                      checked={day.enabled}
                      onChange={(event) =>
                        updateDay(day.dayOfWeek, {
                          enabled: event.target.checked,
                        })
                      }
                      disabled={isBusy}
                      className="size-4 rounded border"
                    />
                    <Label
                      htmlFor={`day-enabled-${day.dayOfWeek}`}
                      className="font-medium"
                    >
                      {day.label}
                    </Label>
                  </div>

                  <div className="text-muted-foreground flex items-center text-sm md:col-span-3 md:hidden">
                    {day.enabled ? "Buka" : "Tutup"}
                  </div>

                  <div className="hidden md:block" />

                  <div className="space-y-2">
                    <Label htmlFor={`start-${day.dayOfWeek}`}>Waktu Buka</Label>
                    <Input
                      id={`start-${day.dayOfWeek}`}
                      type="time"
                      value={day.startTime}
                      onChange={(event) =>
                        updateDay(day.dayOfWeek, {
                          startTime: event.target.value,
                        })
                      }
                      disabled={!day.enabled || isBusy}
                      required={day.enabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`end-${day.dayOfWeek}`}>Waktu Tutup</Label>
                    <Input
                      id={`end-${day.dayOfWeek}`}
                      type="time"
                      value={day.endTime}
                      onChange={(event) =>
                        updateDay(day.dayOfWeek, {
                          endTime: event.target.value,
                        })
                      }
                      disabled={!day.enabled || isBusy}
                      required={day.enabled}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
