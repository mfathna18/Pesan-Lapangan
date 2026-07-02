import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { typography } from "@/lib/design-system";
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
    <Card>
      <CardHeader className="gap-3 text-center">
        <CardTitle className={typography.h3}>
          Booking Sudah Kedaluwarsa
        </CardTitle>
        <CardDescription className="text-base">
          Slot ini sudah dilepas dan tidak lagi ditahan untukmu.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <p className="text-muted-foreground max-w-md text-center text-sm leading-relaxed">
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
    pending: "border-warning/25 bg-warning/10",
    success: "border-success/25 bg-success/10",
    neutral: "border-border bg-muted/40",
  } as const;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-subtle)]",
        toneClasses[tone],
      )}
    >
      <p className="font-semibold tracking-tight">{label}</p>
      {description ? (
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
