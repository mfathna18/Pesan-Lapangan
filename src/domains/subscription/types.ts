import type {
  SubscriptionPlan,
  SubscriptionStatus,
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
};
