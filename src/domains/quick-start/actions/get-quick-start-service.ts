import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import { createCourtRepository } from "@/domains/booking/repositories/court-repository";
import { createPriceRuleRepository } from "@/domains/booking/repositories/price-rule-repository";
import { createQuickStartService } from "@/domains/quick-start/quick-start-service";
import { createPushSettingsRepository } from "@/domains/push/repositories/push-settings-repository";
import { prisma } from "@/lib/db/prisma";

export function getQuickStartService() {
  return createQuickStartService({
    prisma,
    courtRepository: createCourtRepository(prisma),
    operatingHoursRepository: createOperatingHoursRepository(prisma),
    priceRuleRepository: createPriceRuleRepository(prisma),
    pushSettingsRepository: createPushSettingsRepository(prisma),
  });
}
