import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import { createCourtRepository } from "@/domains/booking/repositories/court-repository";
import { createPriceRuleRepository } from "@/domains/booking/repositories/price-rule-repository";
import { createPriceRuleService } from "@/domains/booking/services/price-rule-service";
import { prisma } from "@/lib/db/prisma";

export function getPriceRuleService() {
  return createPriceRuleService({
    priceRuleRepository: createPriceRuleRepository(prisma),
    courtRepository: createCourtRepository(prisma),
    operatingHoursRepository: createOperatingHoursRepository(prisma),
  });
}
