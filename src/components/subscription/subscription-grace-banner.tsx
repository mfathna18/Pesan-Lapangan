import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { SUBSCRIPTION_GRACE_PERIOD_DAYS } from "@/domains/subscription/constants";
import type { SubscriptionAccessSnapshot } from "@/domains/subscription/types";
import { formatDateTime } from "@/domains/booking/utils/booking-display";
import { cn } from "@/lib/utils";

type SubscriptionGraceBannerProps = {
  access: SubscriptionAccessSnapshot;
};

export function SubscriptionGraceBanner({
  access,
}: SubscriptionGraceBannerProps) {
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            Langganan memasuki masa grace period
          </p>
          <p className="text-sm text-amber-800/90 dark:text-amber-100/80">
            Akses penuh masih aktif selama {SUBSCRIPTION_GRACE_PERIOD_DAYS}{" "}
            hari.
            {access.graceUntil
              ? ` Berakhir pada ${formatDateTime(access.graceUntil)}.`
              : null}
          </p>
        </div>
        <Link
          href="/dashboard/subscription"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "shrink-0 border-amber-500/40",
          )}
        >
          Perpanjang Langganan
        </Link>
      </div>
    </div>
  );
}
