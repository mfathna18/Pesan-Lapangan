import Link from "next/link";
import { Clock } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { CUSTOMER_COPY } from "@/config/customer-copy";
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
    <EmptyState
      icon={Clock}
      title={CUSTOMER_COPY.checkout.expiredTitle}
      description={`${CUSTOMER_COPY.checkout.expiredDescription} Silakan pilih slot baru di ${venueName}.`}
      action={
        <Link
          href={`/gor/${venueSlug}`}
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          {CUSTOMER_COPY.checkout.expiredAction}
        </Link>
      }
    />
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
        "rounded-[var(--radius-card-lg)] border p-5 shadow-[var(--shadow-sm)]",
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
