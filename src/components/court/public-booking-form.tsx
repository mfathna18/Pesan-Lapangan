"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  BookingRangeSummary,
  formatBookingDateLabel,
} from "@/components/booking/booking-range-summary";
import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { CustomerFunnelHeader } from "@/components/customer/customer-funnel-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { createPublicBookingAction } from "@/domains/booking/actions/create-public-booking.action";
import type { BookingRangeLineItem } from "@/domains/booking/utils/booking-range";
import { customerLayout } from "@/lib/customer-layout";
import { cn } from "@/lib/utils";

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

function RequiredMark() {
  return (
    <span className="text-destructive ml-1 text-xs font-medium" aria-hidden>
      *
    </span>
  );
}

export function PublicBookingForm({ context }: PublicBookingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerPhone: "",
    note: "",
  });
  const [error, setError] = useState<string | null>(
    context.slotUnavailable ? CUSTOMER_COPY.booking.slotUnavailable : null,
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
      <main className={customerLayout.page}>
        <div
          className={`${customerLayout.container} ${customerLayout.funnelStack}`}
        >
          <CustomerFunnelHeader
            eyebrow={CUSTOMER_COPY.booking.formEyebrow}
            title={CUSTOMER_COPY.booking.formTitle}
            description={CUSTOMER_COPY.booking.formDescription}
          />

          <BookingRangeSummary
            courtName={context.courtName}
            bookingDateLabel={`${bookingDateLabel} · ${context.gorName}`}
            startMinute={context.selection.startMinute}
            endMinute={context.selection.endMinute}
            lineItems={context.selection.lineItems}
            totalPrice={context.selection.price}
            className="border-border bg-card rounded-[var(--radius-card-lg)] border p-6 shadow-[var(--shadow-sm)]"
          />

          <form onSubmit={handleSubmit}>
            <Card className="overflow-hidden">
              <CardHeader className="space-y-2 border-b pb-6">
                <CardTitle className="text-xl">
                  {CUSTOMER_COPY.booking.customerSection}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {CUSTOMER_COPY.booking.customerHint}
                </p>
              </CardHeader>

              <CardContent className={`${customerLayout.formSection} pt-6`}>
                <div className={customerLayout.formField}>
                  <Label htmlFor="customer-name" className="text-base">
                    {CUSTOMER_COPY.booking.nameLabel}
                    <RequiredMark />
                    <span className="sr-only">
                      {CUSTOMER_COPY.booking.nameRequired}
                    </span>
                  </Label>
                  <Input
                    id="customer-name"
                    value={form.customerName}
                    onChange={(event) =>
                      updateField("customerName", event.target.value)
                    }
                    placeholder="Contoh: Budi Santoso"
                    className="h-12"
                    required
                    disabled={context.slotUnavailable}
                  />
                </div>

                <div className={customerLayout.formField}>
                  <Label htmlFor="customer-phone" className="text-base">
                    {CUSTOMER_COPY.booking.phoneLabel}
                    <RequiredMark />
                    <span className="sr-only">
                      {CUSTOMER_COPY.booking.phoneRequired}
                    </span>
                  </Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={form.customerPhone}
                    onChange={(event) =>
                      updateField("customerPhone", event.target.value)
                    }
                    placeholder="081234567890"
                    className="h-12"
                    required
                    disabled={context.slotUnavailable}
                  />
                </div>

                <div className={customerLayout.formField}>
                  <Label htmlFor="customer-note" className="text-base">
                    {CUSTOMER_COPY.booking.noteLabel}
                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                      ({CUSTOMER_COPY.booking.noteOptional})
                    </span>
                  </Label>
                  <Textarea
                    id="customer-note"
                    value={form.note}
                    onChange={(event) =>
                      updateField("note", event.target.value)
                    }
                    placeholder="Permintaan khusus atau catatan tambahan"
                    className="min-h-28"
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
                        {CUSTOMER_COPY.booking.pickOtherTime}
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>

              <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
                <Link
                  href={bookingHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full sm:w-auto",
                  )}
                >
                  {CUSTOMER_COPY.booking.back}
                </Link>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={isPending || context.slotUnavailable}
                >
                  {isPending
                    ? CUSTOMER_COPY.booking.saving
                    : CUSTOMER_COPY.booking.continueCta}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}
