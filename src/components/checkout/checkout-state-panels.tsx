import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CheckoutExpiredStateProps = {
  venueSlug: string;
  venueName: string;
};

export function CheckoutExpiredState({
  venueSlug,
  venueName,
}: CheckoutExpiredStateProps) {
  return (
    <Card className="border-muted">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Booking Sudah Kedaluwarsa</CardTitle>
        <CardDescription className="text-base">
          Slot ini sudah dilepas dan tidak lagi ditahan untukmu.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground max-w-md text-center text-sm">
          Waktu pembayaran untuk booking ini sudah habis. Silakan pilih slot
          baru di {venueName}.
        </p>
        <Link
          href={`/gor/${venueSlug}`}
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          Booking Lagi
        </Link>
      </CardContent>
    </Card>
  );
}

type CheckoutStatusBannerProps = {
  label: string;
  description?: string;
  tone?: "pending" | "success" | "neutral";
};

export function CheckoutStatusBanner({
  label,
  description,
  tone = "pending",
}: CheckoutStatusBannerProps) {
  const toneClasses = {
    pending:
      "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20",
    success:
      "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20",
    neutral: "border-border bg-muted/30",
  } as const;

  return (
    <div className={cn("rounded-xl border p-4", toneClasses[tone])}>
      <p className="font-semibold tracking-tight">{label}</p>
      {description ? (
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      ) : null}
    </div>
  );
}
