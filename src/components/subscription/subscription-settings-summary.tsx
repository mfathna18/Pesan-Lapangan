import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CurrentSubscriptionData } from "@/domains/subscription/types";
import {
  formatBookingDate,
  formatCurrency,
} from "@/domains/booking/utils/booking-display";
import { SUBSCRIPTION_PLAN_PRICES } from "@/domains/subscription/constants";
import { cn } from "@/lib/utils";

type SubscriptionSettingsSummaryProps = {
  subscription: CurrentSubscriptionData;
};

function resolveStatusBadgeVariant(
  subscription: CurrentSubscriptionData,
): "confirmed" | "pending" | "cancelled" | "expired" {
  if (subscription.status === "ACTIVE") {
    return "confirmed";
  }

  if (subscription.status === "TRIAL") {
    return "pending";
  }

  if (subscription.status === "GRACE_PERIOD") {
    return "expired";
  }

  if (subscription.status === "CANCELLED") {
    return "cancelled";
  }

  return "expired";
}

export function SubscriptionSettingsSummary({
  subscription,
}: SubscriptionSettingsSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Langganan</CardTitle>
          <CardDescription>
            Paket aktif, status, dan tanggal perpanjangan venue Anda.
          </CardDescription>
        </div>
        <Badge variant={resolveStatusBadgeVariant(subscription)}>
          {subscription.statusLabel}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-sm">Paket Saat Ini</p>
          <p className="font-medium">{subscription.planLabel}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Kapasitas Lapangan</p>
          <p className="font-medium">{subscription.courtCapacity.label}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Harga Bulanan</p>
          <p className="font-medium">
            {formatCurrency(SUBSCRIPTION_PLAN_PRICES[subscription.plan])}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Tanggal Perpanjangan</p>
          <p className="font-medium">
            {subscription.expiresAt
              ? formatBookingDate(subscription.expiresAt)
              : "Belum ditetapkan"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <Link
            href="/dashboard/subscription"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Kelola Langganan
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
