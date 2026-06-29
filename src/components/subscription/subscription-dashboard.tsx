import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SUBSCRIPTION_GRACE_PERIOD_DAYS } from "@/domains/subscription/constants";
import type { CurrentSubscriptionData } from "@/domains/subscription/types";
import {
  formatBookingDate,
  formatDateTime,
} from "@/domains/booking/utils/booking-display";

type SubscriptionDashboardProps = {
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

export function SubscriptionDashboard({
  subscription,
}: SubscriptionDashboardProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Subscription
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Paket Langganan
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Kelola paket langganan venue kamu.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{subscription.planLabel}</CardTitle>
            <Badge variant={resolveStatusBadgeVariant(subscription)}>
              {subscription.statusLabel}
            </Badge>
          </div>
          <CardDescription>
            Status langganan saat ini untuk akun owner kamu.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Paket Saat Ini</p>
            <p className="font-medium">{subscription.planLabel}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Status</p>
            <p className="font-medium">{subscription.statusLabel}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Mulai Berlaku</p>
            <p className="font-medium">
              {formatBookingDate(subscription.startsAt)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Tanggal Kedaluwarsa</p>
            <p className="font-medium">
              {subscription.expiresAt
                ? formatBookingDate(subscription.expiresAt)
                : "Tidak ditetapkan"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Masa Grace Period</p>
            <p className="font-medium">
              {subscription.graceUntil
                ? formatDateTime(subscription.graceUntil)
                : `${SUBSCRIPTION_GRACE_PERIOD_DAYS} hari setelah kedaluwarsa`}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Akses Aktif</p>
            <p className="font-medium">
              {subscription.isActive ? "Ya" : "Tidak"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade Paket</CardTitle>
          <CardDescription>
            Tingkatkan paket untuk fitur lanjutan. Pembayaran belum tersedia di
            sprint ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" disabled>
            Upgrade Paket
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
