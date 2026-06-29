export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
} as const;

export const PAYMENT_METHOD = {
  MIDTRANS: "MIDTRANS",
} as const;

export const PAYMENT_METHOD_LABELS = {
  MIDTRANS: "Midtrans",
} as const;

export const DEFAULT_PAYMENT_METHOD = PAYMENT_METHOD.MIDTRANS;

export const REVENUE_RECENT_PAYMENTS_LIMIT = 20 as const;

export const REVENUE_DATE_RANGE = {
  TODAY: "today",
  SEVEN_DAYS: "7days",
  THIRTY_DAYS: "30days",
  CUSTOM: "custom",
} as const;

export type RevenueDateRangePreset =
  (typeof REVENUE_DATE_RANGE)[keyof typeof REVENUE_DATE_RANGE];

export const REVENUE_DEFAULT_DATE_RANGE = REVENUE_DATE_RANGE.THIRTY_DAYS;
