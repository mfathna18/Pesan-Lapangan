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
import type { SubscriptionCourtCapacity } from "@/domains/subscription/types";
import { SUBSCRIPTION_PLAN_LABELS } from "@/domains/subscription/constants";
import type { SubscriptionPlan } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type SubscriptionCourtCapacityCardProps = {
  plan: SubscriptionPlan;
  courtCapacity: SubscriptionCourtCapacity;
};

export function SubscriptionCourtCapacityCard({
  plan,
  courtCapacity,
}: SubscriptionCourtCapacityCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Kapasitas Lapangan</CardTitle>
          <CardDescription>
            Paket {SUBSCRIPTION_PLAN_LABELS[plan]} · {courtCapacity.label}
          </CardDescription>
        </div>
        <Badge variant={courtCapacity.canCreateCourt ? "confirmed" : "expired"}>
          {courtCapacity.canCreateCourt ? "Tersedia" : "Penuh"}
        </Badge>
      </CardHeader>
      {!courtCapacity.canCreateCourt ? (
        <CardContent>
          <p className="text-muted-foreground mb-3 text-sm">
            Batas lapangan paket Anda telah tercapai. Upgrade paket untuk
            menambahkan lapangan baru.
          </p>
          <Link
            href="/dashboard/subscription"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Upgrade Paket
          </Link>
        </CardContent>
      ) : null}
    </Card>
  );
}
