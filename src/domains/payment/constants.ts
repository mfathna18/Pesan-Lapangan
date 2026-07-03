export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  AWAITING_CONFIRMATION: "AWAITING_CONFIRMATION",
  PAID: "PAID",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
  REJECTED: "REJECTED",
} as const;

export const PAYMENT_METHOD = {
  MIDTRANS: "MIDTRANS",
  MANUAL_TRANSFER: "MANUAL_TRANSFER",
} as const;

export const PAYMENT_METHOD_LABELS = {
  MIDTRANS: "Midtrans",
  MANUAL_TRANSFER: "Transfer Manual",
} as const;

export const DEFAULT_PAYMENT_METHOD = PAYMENT_METHOD.MANUAL_TRANSFER;

export const PAYMENT_REJECTION_REASONS = [
  "Pembayaran belum diterima.",
  "Nominal tidak sesuai.",
  "Bukti pembayaran tidak valid.",
] as const;

export const PAYMENT_CONFIRMATION_ACTION = {
  CREATED: "CREATED",
  CUSTOMER_CONFIRMED: "CUSTOMER_CONFIRMED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

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
