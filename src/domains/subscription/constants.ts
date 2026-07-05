export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 3 as const;

export const SUBSCRIPTION_BILLING_PERIOD_DAYS = 30 as const;

export const DEFAULT_SUBSCRIPTION_PLAN = "FREE" as const;

export const DEFAULT_SUBSCRIPTION_STATUS = "TRIAL" as const;

export const SUBSCRIPTION_PLAN_LABELS = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
  ELITE: "Elite",
} as const;

export const SUBSCRIPTION_STATUS_LABELS = {
  TRIAL: "Trial",
  ACTIVE: "Active",
  GRACE_PERIOD: "Grace Period",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
} as const;

export const SUBSCRIPTION_ACTIVE_STATUSES = [
  "TRIAL",
  "ACTIVE",
  "GRACE_PERIOD",
] as const;

export const SUBSCRIPTION_OWNER_FEATURE_STATUSES = [
  "TRIAL",
  "ACTIVE",
  "GRACE_PERIOD",
] as const;

export const SUBSCRIPTION_ACCESS_DENIED_MESSAGE =
  "Langganan kamu telah kedaluwarsa. Perpanjang langganan untuk menggunakan fitur ini." as const;

export const SUBSCRIPTION_BOOKING_RECEIVING_DENIED_MESSAGE =
  "Venue tidak menerima booking baru saat ini." as const;

export const SUBSCRIPTION_PAYMENT_UNAVAILABLE_MESSAGE =
  "Pembayaran online akan tersedia setelah akun pembayaran aktif." as const;

export const SUBSCRIPTION_BILLING_ACTION = {
  UPGRADE: "UPGRADE",
  RENEW: "RENEW",
} as const;

export const SUBSCRIPTION_BILLING_ACTION_LABELS = {
  UPGRADE: "Upgrade",
  RENEW: "Perpanjang",
} as const;

export const SUBSCRIPTION_PLAN_PRICES = {
  FREE: 0,
  STARTER: 175_000,
  PRO: 250_000,
  ELITE: 450_000,
} as const;

export const SUBSCRIPTION_PLAN_ORDER = [
  "FREE",
  "STARTER",
  "PRO",
  "ELITE",
] as const;

export const SUBSCRIPTION_PAID_PLANS = ["STARTER", "PRO", "ELITE"] as const;

export const SUBSCRIPTION_BEST_VALUE_PLAN = "PRO" as const;

export const SUBSCRIPTION_PLAN_COURT_LIMIT_LABELS = {
  FREE: "Hingga 2 Lapangan",
  STARTER: "Hingga 2 Lapangan",
  PRO: "Hingga 5 Lapangan",
  ELITE: "Unlimited Lapangan",
} as const;

export const SUBSCRIPTION_PLAN_SHARED_FEATURES = [
  "Booking Online",
  "Dashboard",
  "Invoice",
  "Export",
  "Analytics",
  "Browser Notification",
  "PWA",
] as const;

export const SUBSCRIPTION_PAYMENT_STATUS_LABELS: Record<
  import("@/generated/prisma/client").PaymentStatus,
  string
> = {
  PENDING: "Pending",
  AWAITING_CONFIRMATION: "Awaiting Confirmation",
  PAID: "Paid",
  FAILED: "Failed",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
  REJECTED: "Rejected",
};
