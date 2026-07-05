"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SUBSCRIPTION_BILLING_ACTION,
  SUBSCRIPTION_PLAN_SHARED_FEATURES,
  SUBSCRIPTION_PAYMENT_UNAVAILABLE_MESSAGE,
} from "@/domains/subscription/constants";
import { SUBSCRIPTION_DOWNGRADE_COURT_VALIDATION_MESSAGE } from "@/domains/subscription/utils/subscription-plan-limits";
import { createSubscriptionPaymentAction } from "@/domains/subscription/actions/create-subscription-payment.action";
import type { CurrentSubscriptionData } from "@/domains/subscription/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";
import { cn } from "@/lib/utils";

type SubscriptionPlanCardsProps = {
  subscription: CurrentSubscriptionData;
};

export function SubscriptionPlanCards({
  subscription,
}: SubscriptionPlanCardsProps) {
  const [isPending, startTransition] = useTransition();

  function handleSelectPlan(
    plan: CurrentSubscriptionData["planOptions"][number],
  ) {
    if (!plan.canSelect) {
      return;
    }

    const billingAction =
      plan.action === "renew"
        ? SUBSCRIPTION_BILLING_ACTION.RENEW
        : SUBSCRIPTION_BILLING_ACTION.UPGRADE;

    startTransition(async () => {
      const result = await createSubscriptionPaymentAction({
        billingAction,
        targetPlan: plan.plan,
      });

      if (!result.success) {
        window.alert(result.error);
        return;
      }

      window.location.href = result.data.paymentUrl;
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Paket</CardTitle>
          <CardDescription>
            Semua paket berbayar mencakup fitur inti PesanLapangan. Perbedaan
            utama ada pada jumlah lapangan yang dapat dikelola.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SUBSCRIPTION_PLAN_SHARED_FEATURES.map((feature) => (
              <li
                key={feature}
                className="text-muted-foreground flex items-center gap-2 text-sm"
              >
                <Check className="text-primary size-4 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {subscription.planOptions.map((plan) => {
          const isDowngradeBlocked =
            plan.action === "downgrade" && !plan.canSelect;

          return (
            <Card
              key={plan.plan}
              className={cn(
                "flex flex-col",
                plan.isBestValue && "border-primary shadow-md",
                plan.isCurrent && "ring-primary/30 ring-2",
              )}
            >
              <CardHeader className="space-y-3">
                {plan.isBestValue ? (
                  <div className="flex justify-center">
                    <Badge className="bg-primary text-primary-foreground">
                      BEST VALUE
                    </Badge>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.label}</CardTitle>
                  {plan.isCurrent ? (
                    <Badge variant="confirmed">Paket Aktif</Badge>
                  ) : null}
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight">
                    {formatCurrency(plan.price)}
                  </p>
                  <p className="text-muted-foreground text-sm">/ bulan</p>
                </div>
                <CardDescription className="text-foreground font-medium">
                  {plan.courtLimitLabel}
                </CardDescription>
              </CardHeader>

              <CardContent className="mt-auto space-y-3">
                {isDowngradeBlocked ? (
                  <p className="text-muted-foreground text-sm">
                    {SUBSCRIPTION_DOWNGRADE_COURT_VALIDATION_MESSAGE}
                  </p>
                ) : null}

                {plan.isCurrent ? (
                  subscription.canRenew ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await createSubscriptionPaymentAction({
                            billingAction: SUBSCRIPTION_BILLING_ACTION.RENEW,
                            targetPlan: plan.plan,
                          });

                          if (!result.success) {
                            window.alert(result.error);
                            return;
                          }

                          window.location.href = result.data.paymentUrl;
                        })
                      }
                    >
                      {isPending ? "Memproses..." : "Perpanjang Paket"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      className="w-full"
                    >
                      Paket Saat Ini
                    </Button>
                  )
                ) : plan.canSelect ? (
                  <Button
                    type="button"
                    className={cn("w-full", plan.isBestValue && "bg-primary")}
                    disabled={isPending}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isPending
                      ? "Memproses..."
                      : plan.action === "upgrade"
                        ? `Pilih ${plan.label}`
                        : `Pilih ${plan.label}`}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="w-full"
                  >
                    Tidak Tersedia
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-muted-foreground text-center text-sm">
        {SUBSCRIPTION_PAYMENT_UNAVAILABLE_MESSAGE}
      </p>
    </div>
  );
}
