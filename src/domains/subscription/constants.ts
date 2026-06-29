export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 3 as const;

export const DEFAULT_SUBSCRIPTION_PLAN = "FREE" as const;

export const DEFAULT_SUBSCRIPTION_STATUS = "TRIAL" as const;

export const SUBSCRIPTION_PLAN_LABELS = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
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
