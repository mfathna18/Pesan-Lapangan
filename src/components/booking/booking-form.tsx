"use client";

import { useState, useTransition } from "react";

import {
  getTodayDateInputValue,
  timeStringToStartMinute,
} from "@/components/booking/booking-form.utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBookingAction } from "@/domains/booking/actions/create-booking.action";
import { BOOKING_DURATION_INTERVAL_MINUTES } from "@/domains/booking/constants";
import type { CourtOption } from "@/domains/booking/repositories/court-repository";
import { UI_COPY } from "@/config/ui-copy";
import { cn } from "@/lib/utils";

type BookingFormProps = {
  courts: CourtOption[];
};

type FormState = {
  courtId: string;
  bookingDate: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  notes: string;
};

const initialFormState = (): FormState => ({
  courtId: "",
  bookingDate: getTodayDateInputValue(),
  startTime: "08:00",
  customerName: "",
  customerPhone: "",
  notes: "",
});

export function BookingForm({ courts }: BookingFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateField = <TKey extends keyof FormState>(
    key: TKey,
    value: FormState[TKey],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const startMinute = timeStringToStartMinute(form.startTime);

    if (Number.isNaN(startMinute)) {
      setError("Waktu mulai tidak valid.");
      return;
    }

    startTransition(async () => {
      const result = await createBookingAction({
        courtId: form.courtId,
        bookingDate: form.bookingDate,
        startMinute,
        endMinute: startMinute + BOOKING_DURATION_INTERVAL_MINUTES,
        contact: {
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          note: form.notes.trim() ? form.notes.trim() : null,
        },
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccessMessage(
        `Booking ${result.data.bookingNumber} berhasil dibuat.`,
      );
      setForm(initialFormState());
    });
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Buat Booking</CardTitle>
        <CardDescription>
          Catat booking lapangan baru untuk venue Anda.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {courts.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-sm">
              Tidak ada lapangan aktif. Tambahkan lapangan terlebih dahulu
              sebelum membuat booking.
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
            >
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p
              role="status"
              className="border-primary/20 bg-primary/5 text-foreground rounded-lg border px-4 py-3 text-sm"
            >
              {successMessage}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="courtId">{UI_COPY.court}</Label>
              <Select
                value={form.courtId}
                onValueChange={(value) => updateField("courtId", value ?? "")}
                disabled={isPending || courts.length === 0}
              >
                <SelectTrigger
                  id="courtId"
                  className="w-full"
                  aria-invalid={!form.courtId}
                >
                  <SelectValue placeholder={UI_COPY.selectCourt} />
                </SelectTrigger>
                <SelectContent>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name} ({court.sportType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingDate">Tanggal Booking</Label>
              <Input
                id="bookingDate"
                type="date"
                value={form.bookingDate}
                onChange={(event) =>
                  updateField("bookingDate", event.target.value)
                }
                disabled={isPending || courts.length === 0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Waktu Mulai</Label>
              <Input
                id="startTime"
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  updateField("startTime", event.target.value)
                }
                disabled={isPending || courts.length === 0}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="durationMinute">Durasi</Label>
              <Input
                id="durationMinute"
                value={`${BOOKING_DURATION_INTERVAL_MINUTES} menit`}
                readOnly
                disabled
                className="bg-muted/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Nama Pelanggan</Label>
              <Input
                id="customerName"
                value={form.customerName}
                onChange={(event) =>
                  updateField("customerName", event.target.value)
                }
                disabled={isPending || courts.length === 0}
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telepon Pelanggan</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={form.customerPhone}
                onChange={(event) =>
                  updateField("customerPhone", event.target.value)
                }
                disabled={isPending || courts.length === 0}
                autoComplete="tel"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                disabled={isPending || courts.length === 0}
                placeholder="Catatan tambahan untuk booking"
                rows={4}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className={cn("border-t-0 bg-transparent")}>
          <Button
            type="submit"
            disabled={isPending || courts.length === 0 || !form.courtId}
          >
            {isPending ? "Membuat booking..." : "Buat booking"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
