"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { CourtDetailHeader } from "@/components/court/court-detail-header";
import {
  BookingRangeSummary,
  formatBookingDateLabel,
} from "@/components/booking/booking-range-summary";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { createPublicBookingAction } from "@/domains/booking/actions/create-public-booking.action";
import type { BookingRangeLineItem } from "@/domains/booking/utils/booking-range";

type PublicBookingSelection = {
  bookingDate: string;
  startMinute: number;
  endMinute: number;
  durationMinute: number;
  price: number;
  lineItems: BookingRangeLineItem[];
};

type PublicBookingFormContext = {
  gorSlug: string;
  gorName: string;
  courtId: string;
  courtName: string;
  sportLabel: string;
  selection: PublicBookingSelection;
  slotUnavailable: boolean;
};

type PublicBookingFormProps = {
  context: PublicBookingFormContext;
};

type FormState = {
  customerName: string;
  customerPhone: string;
  note: string;
};

export function PublicBookingForm({ context }: PublicBookingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerPhone: "",
    note: "",
  });
  const [error, setError] = useState<string | null>(
    context.slotUnavailable
      ? "Slot waktu yang dipilih sudah tidak tersedia. Silakan pilih waktu lain."
      : null,
  );
  const [isPending, startTransition] = useTransition();

  const bookingDateLabel = formatBookingDateLabel(
    context.selection.bookingDate,
  );
  const bookingHref = `/gor/${context.gorSlug}/court/${context.courtId}/booking`;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (context.slotUnavailable) {
      return;
    }

    startTransition(async () => {
      const response = await createPublicBookingAction({
        gorSlug: context.gorSlug,
        courtId: context.courtId,
        bookingDate: context.selection.bookingDate,
        startMinute: context.selection.startMinute,
        endMinute: context.selection.endMinute,
        contact: {
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          note: form.note || null,
        },
      });

      if (!response.success) {
        setError(response.error);
        return;
      }

      const checkoutUrl = `/gor/${context.gorSlug}/checkout/${response.data.id}`;
      router.push(checkoutUrl);
    });
  }

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader gorSlug={context.gorSlug} gorName={context.gorName} />
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              Data Booking
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Lengkapi Informasi
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Isi data kontak untuk melanjutkan ke checkout.
            </p>
          </div>

          <BookingRangeSummary
            courtName={context.courtName}
            bookingDateLabel={`${bookingDateLabel} · ${context.gorName}`}
            startMinute={context.selection.startMinute}
            endMinute={context.selection.endMinute}
            lineItems={context.selection.lineItems}
            totalPrice={context.selection.price}
          />

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pelanggan</CardTitle>
                <CardDescription>
                  Nama dan nomor telepon wajib diisi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Nama</Label>
                  <Input
                    id="customer-name"
                    value={form.customerName}
                    onChange={(event) =>
                      updateField("customerName", event.target.value)
                    }
                    placeholder="Nama lengkap"
                    required
                    disabled={context.slotUnavailable}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Nomor Telepon</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={form.customerPhone}
                    onChange={(event) =>
                      updateField("customerPhone", event.target.value)
                    }
                    placeholder="081234567890"
                    required
                    disabled={context.slotUnavailable}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-note">Catatan (opsional)</Label>
                  <Textarea
                    id="customer-note"
                    value={form.note}
                    onChange={(event) =>
                      updateField("note", event.target.value)
                    }
                    placeholder="Permintaan khusus atau catatan tambahan"
                    disabled={context.slotUnavailable}
                  />
                </div>

                {error ? (
                  <div className="space-y-3" role="alert">
                    <p className="text-destructive text-sm">{error}</p>
                    {context.slotUnavailable ||
                    error.includes("tidak tersedia") ? (
                      <Link
                        href={bookingHref}
                        className={buttonVariants({ variant: "outline" })}
                      >
                        Pilih Waktu Lain
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Link
                  href={bookingHref}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Kembali
                </Link>
                <Button
                  type="submit"
                  disabled={isPending || context.slotUnavailable}
                >
                  {isPending ? "Menyimpan..." : "Buat Booking"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}
