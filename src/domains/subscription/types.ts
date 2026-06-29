import type {
  SubscriptionBillingAction,
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/client";

export type SubscriptionRecord = {
  id: string;
  ownerId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startsAt: Date;
  expiresAt: Date | null;
  graceUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SubscriptionPaymentRecord = {
  id: string;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  targetPlan: SubscriptionPlan;
  billingAction: SubscriptionBillingAction;
  externalReference: string | null;
  paidAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OwnerBillingProfile = {
  ownerId: string;
  customerName: string;
  customerPhone: string;
};

export type CurrentSubscriptionData = {
  id: string;
  ownerId: string;
  plan: SubscriptionPlan;
  planLabel: string;
  status: SubscriptionStatus;
  statusLabel: string;
  startsAt: string;
  expiresAt: string | null;
  graceUntil: string | null;
  isActive: boolean;
  isWithinGracePeriod: boolean;
  nextUpgradePlan: SubscriptionPlan | null;
  nextUpgradePlanLabel: string | null;
  canRenew: boolean;
  billingHistory: SubscriptionBillingHistoryItem[];
};

export type SubscriptionBillingHistoryItem = {
  id: string;
  amount: number;
  status: PaymentStatus;
  statusLabel: string;
  targetPlan: SubscriptionPlan;
  targetPlanLabel: string;
  billingAction: SubscriptionBillingAction;
  billingActionLabel: string;
  paidAt: string | null;
  createdAt: string;
};

export type CreateSubscriptionPaymentInput = {
  userId: string;
  billingAction: SubscriptionBillingAction;
  targetPlan?: SubscriptionPlan;
};

export type CreateSubscriptionPaymentResult = {
  paymentUrl: string;
  token: string;
  transactionId: string;
  subscriptionPaymentId: string;
};

export type ActivateSubscriptionInput = {
  subscriptionPaymentId: string;
  paidAt?: Date;
};

export type SubscriptionMidtransCallbackPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_time?: string;
};
