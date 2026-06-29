import {
  DEFAULT_SUBSCRIPTION_PLAN,
  DEFAULT_SUBSCRIPTION_STATUS,
} from "@/domains/subscription/constants";
import type { SubscriptionRecord } from "@/domains/subscription/types";
import type { PrismaClient } from "@/generated/prisma/client";

const subscriptionSelect = {
  id: true,
  ownerId: true,
  plan: true,
  status: true,
  startsAt: true,
  expiresAt: true,
  graceUntil: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByOwnerId(ownerId: string): Promise<SubscriptionRecord | null> {
    return this.prisma.subscription.findUnique({
      where: { ownerId },
      select: subscriptionSelect,
    });
  }

  async findByUserId(userId: string): Promise<SubscriptionRecord | null> {
    return this.prisma.subscription.findFirst({
      where: {
        owner: {
          userId,
        },
      },
      select: subscriptionSelect,
    });
  }

  async findOwnerIdByUserId(userId: string): Promise<string | null> {
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
      select: { id: true },
    });

    return owner?.id ?? null;
  }

  async createDefaultForOwner(ownerId: string): Promise<SubscriptionRecord> {
    return this.prisma.subscription.create({
      data: {
        ownerId,
        plan: DEFAULT_SUBSCRIPTION_PLAN,
        status: DEFAULT_SUBSCRIPTION_STATUS,
      },
      select: subscriptionSelect,
    });
  }
}

export function createSubscriptionRepository(
  prisma: PrismaClient,
): SubscriptionRepository {
  return new SubscriptionRepository(prisma);
}
