import type { MidtransCallbackPayload } from "@/domains/payment/types";

export type MidtransCallbackResolution =
  "paid" | "expired" | "failed" | "pending" | "ignored";

export function resolveMidtransCallbackStatus(
  payload: MidtransCallbackPayload,
): MidtransCallbackResolution {
  const { transaction_status, fraud_status } = payload;

  if (transaction_status === "settlement") {
    return "paid";
  }

  if (transaction_status === "capture" && fraud_status === "accept") {
    return "paid";
  }

  if (transaction_status === "expire") {
    return "expired";
  }

  if (transaction_status === "cancel") {
    return "failed";
  }

  if (transaction_status === "deny") {
    return "ignored";
  }

  if (transaction_status === "pending") {
    return "pending";
  }

  return "ignored";
}

export function parseMidtransTransactionTime(
  transactionTime?: string,
): Date | undefined {
  if (!transactionTime) {
    return undefined;
  }

  const normalized = transactionTime.replace(" ", "T");
  const parsed = new Date(`${normalized}+07:00`);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
