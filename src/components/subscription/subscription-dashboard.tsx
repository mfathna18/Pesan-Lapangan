import { SubscriptionBillingActions } from "@/components/subscription/subscription-billing-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SUBSCRIPTION_GRACE_PERIOD_DAYS,
  SUBSCRIPTION_PLAN_PRICES,
} from "@/domains/subscription/constants";
import type { CurrentSubscriptionData } from "@/domains/subscription/types";
import {
  formatBookingDate,
  formatCurrency,
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

function resolvePaymentStatusBadgeVariant(
  status: CurrentSubscriptionData["billingHistory"][number]["status"],
): "confirmed" | "pending" | "cancelled" | "expired" {
  if (status === "PAID") {
    return "confirmed";
  }

  if (status === "PENDING") {
    return "pending";
  }

  if (status === "REFUNDED") {
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
          Langganan
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
            <CardTitle>Paket Saat Ini</CardTitle>
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
            <p className="text-muted-foreground text-sm">Paket</p>
            <p className="font-medium">{subscription.planLabel}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Harga Bulanan</p>
            <p className="font-medium">
              {formatCurrency(SUBSCRIPTION_PLAN_PRICES[subscription.plan])}
            </p>
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

      {subscription.nextUpgradePlan || subscription.canRenew ? (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade & Perpanjang</CardTitle>
            <CardDescription>
              Tingkatkan paket atau perpanjang langganan aktif melalui Midtrans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionBillingActions subscription={subscription} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Billing</CardTitle>
          <CardDescription>
            Daftar pembayaran langganan yang pernah dibuat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.billingHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Belum ada riwayat pembayaran langganan.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscription.billingHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {formatDateTime(payment.paidAt ?? payment.createdAt)}
                    </TableCell>
                    <TableCell>{payment.billingActionLabel}</TableCell>
                    <TableCell>{payment.targetPlanLabel}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={resolvePaymentStatusBadgeVariant(
                          payment.status,
                        )}
                      >
                        {payment.statusLabel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
