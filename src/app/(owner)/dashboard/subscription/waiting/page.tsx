import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import { SUBSCRIPTION_PLAN_LABELS } from "@/domains/subscription/constants";
import {
  OwnerSubscriptionNotFoundError,
  SubscriptionPaymentNotFoundError,
} from "@/domains/subscription/errors";
import {
  formatCurrency,
  formatDateTime,
} from "@/domains/booking/utils/booking-display";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

type SubscriptionWaitingPageProps = {
  searchParams: Promise<{
    paymentId?: string;
  }>;
};

export default async function SubscriptionWaitingPage({
  searchParams,
}: SubscriptionWaitingPageProps) {
  const session = await requireOwnerSession();
  const { paymentId } = await searchParams;

  if (!paymentId) {
    notFound();
  }

  try {
    const { payment, subscription } =
      await getSubscriptionService().getSubscriptionPaymentForOwner(
        session.user.id,
        paymentId,
      );

    const isPaid = payment.status === "PAID";

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            Menunggu Pembayaran
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Pembayaran Langganan
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Kami menunggu konfirmasi dari Midtrans. Paket langganan akan
            diperbarui setelah pembayaran berhasil.
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{subscription.planLabel}</CardTitle>
              <Badge variant={isPaid ? "confirmed" : "pending"}>
                {isPaid ? "Paid" : "Pending"}
              </Badge>
            </div>
            <CardDescription>Detail pembayaran langganan kamu.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Paket Tujuan</p>
              <p className="font-medium">
                {SUBSCRIPTION_PLAN_LABELS[payment.targetPlan]}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-xl font-semibold">
                {formatCurrency(payment.amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Dibuat</p>
              <p className="font-medium">
                {formatDateTime(payment.createdAt.toISOString())}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Status Langganan</p>
              <p className="font-medium">{subscription.statusLabel}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/subscription"
            className={cn(buttonVariants(), "flex-1")}
          >
            Kembali ke Subscription
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    if (
      error instanceof OwnerSubscriptionNotFoundError ||
      error instanceof SubscriptionPaymentNotFoundError
    ) {
      notFound();
    }

    throw error;
  }
}
