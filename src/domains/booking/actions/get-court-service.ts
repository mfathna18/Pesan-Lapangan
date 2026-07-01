import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import { createCourtRepository } from "@/domains/booking/repositories/court-repository";
import { createPriceRuleRepository } from "@/domains/booking/repositories/price-rule-repository";
import { createCourtService } from "@/domains/booking/services/court-service";
import { createGorRepository } from "@/domains/owner/repositories/gor-repository";
import { prisma } from "@/lib/db/prisma";

export function getCourtService() {
  return createCourtService({
    courtRepository: createCourtRepository(prisma),
    operatingHoursRepository: createOperatingHoursRepository(prisma),
    priceRuleRepository: createPriceRuleRepository(prisma),
    gorRepository: createGorRepository(prisma),
  });
}
