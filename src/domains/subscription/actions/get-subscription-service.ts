import { createSubscriptionService } from "@/domains/subscription/services/subscription-service";
import { prisma } from "@/lib/db/prisma";

export function getSubscriptionService() {
  return createSubscriptionService(prisma);
}
