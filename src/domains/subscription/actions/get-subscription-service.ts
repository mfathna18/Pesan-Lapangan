import { createSubscriptionRepository } from "@/domains/subscription/repositories/subscription-repository";
import { createSubscriptionService } from "@/domains/subscription/services/subscription-service";
import { prisma } from "@/lib/db/prisma";

export function getSubscriptionService() {
  return createSubscriptionService(createSubscriptionRepository(prisma));
}
