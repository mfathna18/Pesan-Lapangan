"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSubscriptionPaymentAction } from "@/domains/subscription/actions/create-subscription-payment.action";
import { SUBSCRIPTION_BILLING_ACTION } from "@/domains/subscription/constants";

export function SubscriptionExpiredBlock() {
  const [isPending, startTransition] = useTransition();

  const handleRenew = () => {
    startTransition(async () => {
      const result = await createSubscriptionPaymentAction({
        billingAction: SUBSCRIPTION_BILLING_ACTION.RENEW,
      });

      if (!result.success) {
        window.location.href = "/dashboard/subscription";
        return;
      }

      window.location.href = result.data.paymentUrl;
    });
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2">
          <CardTitle>Langganan Kedaluwarsa</CardTitle>
          <CardDescription>
            Subscription expired. Perpanjang langganan untuk melanjutkan
            menggunakan fitur owner.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Kamu masih bisa masuk dan melihat dashboard, tetapi fitur seperti
            membuat booking, mengelola lapangan, pricing, dan jam operasional
            tidak tersedia sampai langganan diperpanjang.
          </p>
          <Button type="button" disabled={isPending} onClick={handleRenew}>
            {isPending ? "Memproses..." : "Perpanjang Langganan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
