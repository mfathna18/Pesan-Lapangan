import { createAvailabilityService } from "@/domains/availability/services/availability-service";
import { prisma } from "@/lib/db/prisma";

export function getAvailabilityService() {
  return createAvailabilityService(prisma);
}
