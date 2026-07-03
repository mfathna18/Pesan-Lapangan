"use client";

import { useCallback, useEffect, useState } from "react";

import { OwnerPendingPaymentsWidget } from "@/components/dashboard/owner-pending-payments-widget";
import { POLL_INTERVALS } from "@/config/polling-intervals";
import { listAwaitingManualPaymentsAction } from "@/domains/payment/actions/owner-manual-payment.action";
import type { AwaitingConfirmationPaymentItem } from "@/domains/payment/types";
import { usePolling } from "@/hooks/use-polling";

type OwnerPendingPaymentsPollingWidgetProps = {
  initialItems: AwaitingConfirmationPaymentItem[];
};

export function OwnerPendingPaymentsPollingWidget({
  initialItems,
}: OwnerPendingPaymentsPollingWidgetProps) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const refreshPendingPayments = useCallback(async () => {
    const nextItems = await listAwaitingManualPaymentsAction();
    setItems(nextItems);
  }, []);

  usePolling(refreshPendingPayments, POLL_INTERVALS.OWNER_PENDING_PAYMENTS_MS);

  return <OwnerPendingPaymentsWidget items={items} />;
}
