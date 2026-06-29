import {
  SUBSCRIPTION_PLAN_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/domains/subscription/constants";
import { OwnerSubscriptionNotFoundError } from "@/domains/subscription/errors";
import { SubscriptionRepository } from "@/domains/subscription/repositories/subscription-repository";
import type {
  CurrentSubscriptionData,
  SubscriptionRecord,
} from "@/domains/subscription/types";

export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async getCurrentSubscription(
    userId: string,
  ): Promise<CurrentSubscriptionData> {
    const ownerId =
      await this.subscriptionRepository.findOwnerIdByUserId(userId);

    if (!ownerId) {
      throw new OwnerSubscriptionNotFoundError();
    }

    let subscription = await this.subscriptionRepository.findByOwnerId(ownerId);

    if (!subscription) {
      subscription =
        await this.subscriptionRepository.createDefaultForOwner(ownerId);
    }

    return this.toCurrentSubscriptionData(subscription);
  }

  isSubscriptionActive(
    subscription: Pick<
      SubscriptionRecord,
      "status" | "expiresAt" | "graceUntil"
    >,
    referenceDate: Date = new Date(),
  ): boolean {
    if (
      subscription.status === "CANCELLED" ||
      subscription.status === "EXPIRED"
    ) {
      return false;
    }

    if (subscription.status === "GRACE_PERIOD") {
      return this.isWithinGracePeriod(subscription, referenceDate);
    }

    if (
      subscription.expiresAt &&
      subscription.expiresAt.getTime() < referenceDate.getTime()
    ) {
      return this.isWithinGracePeriod(subscription, referenceDate);
    }

    return (
      subscription.status === "TRIAL" ||
      subscription.status === "ACTIVE" ||
      subscription.status === "GRACE_PERIOD"
    );
  }

  isWithinGracePeriod(
    subscription: Pick<SubscriptionRecord, "graceUntil">,
    referenceDate: Date = new Date(),
  ): boolean {
    if (!subscription.graceUntil) {
      return false;
    }

    return referenceDate.getTime() <= subscription.graceUntil.getTime();
  }

  private toCurrentSubscriptionData(
    subscription: SubscriptionRecord,
  ): CurrentSubscriptionData {
    const isWithinGracePeriod = this.isWithinGracePeriod(subscription);

    return {
      id: subscription.id,
      ownerId: subscription.ownerId,
      plan: subscription.plan,
      planLabel: SUBSCRIPTION_PLAN_LABELS[subscription.plan],
      status: subscription.status,
      statusLabel: SUBSCRIPTION_STATUS_LABELS[subscription.status],
      startsAt: subscription.startsAt.toISOString(),
      expiresAt: subscription.expiresAt?.toISOString() ?? null,
      graceUntil: subscription.graceUntil?.toISOString() ?? null,
      isActive: this.isSubscriptionActive(subscription),
      isWithinGracePeriod,
    };
  }
}

export function createSubscriptionService(
  subscriptionRepository: SubscriptionRepository,
): SubscriptionService {
  return new SubscriptionService(subscriptionRepository);
}
