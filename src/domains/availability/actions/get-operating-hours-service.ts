import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import { createOperatingHoursService } from "@/domains/availability/services/operating-hours-service";
import { createCourtRepository } from "@/domains/booking/repositories/court-repository";
import { prisma } from "@/lib/db/prisma";

export function getOperatingHoursService() {
  return createOperatingHoursService({
    operatingHoursRepository: createOperatingHoursRepository(prisma),
    courtRepository: createCourtRepository(prisma),
  });
}
