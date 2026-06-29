import { createSubscriptionService } from "@/domains/subscription/services/subscription-service";
import type { PrismaClient } from "@/generated/prisma/client";

export type SubscriptionAccessReader = {
  assertCanReceiveBookings(courtId: string): Promise<void>;
};

export function createSubscriptionAccessReader(
  prisma: PrismaClient,
): SubscriptionAccessReader {
  const subscriptionService = createSubscriptionService(prisma);

  return {
    assertCanReceiveBookings(courtId: string) {
      return subscriptionService.assertCanReceiveBookingsForCourt(courtId);
    },
  };
}
