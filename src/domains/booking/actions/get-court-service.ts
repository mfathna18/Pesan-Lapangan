import { createCourtRepository } from "@/domains/booking/repositories/court-repository";
import { createCourtService } from "@/domains/booking/services/court-service";
import { prisma } from "@/lib/db/prisma";

export function getCourtService() {
  return createCourtService(createCourtRepository(prisma));
}
