import { createOperatingHoursRepository } from "@/domains/availability/repositories/operating-hours-repository";
import { createCourtRepository } from "@/domains/booking/repositories/court-repository";
import { createPriceRuleRepository } from "@/domains/booking/repositories/price-rule-repository";
import type { GorProfileData } from "@/domains/owner/types";
import { createPushSettingsRepository } from "@/domains/push/repositories/push-settings-repository";
import {
  QUICK_START_STEP_ID,
  type QuickStartProgressData,
  type QuickStartStepId,
  type QuickStartStepStatus,
} from "@/domains/quick-start/types";
import type { PrismaClient } from "@/generated/prisma/client";

type QuickStartServiceDependencies = {
  prisma: PrismaClient;
  courtRepository: ReturnType<typeof createCourtRepository>;
  operatingHoursRepository: ReturnType<typeof createOperatingHoursRepository>;
  priceRuleRepository: ReturnType<typeof createPriceRuleRepository>;
  pushSettingsRepository: ReturnType<typeof createPushSettingsRepository>;
};

function isProfileComplete(profile: GorProfileData | null): boolean {
  if (!profile) {
    return false;
  }

  return (
    profile.name.trim().length > 0 &&
    profile.address.trim().length > 0 &&
    profile.city.trim().length > 0 &&
    profile.province.trim().length > 0 &&
    (profile.phone?.trim().length ?? 0) > 0
  );
}

function isMediaComplete(profile: GorProfileData | null): boolean {
  if (!profile) {
    return false;
  }

  return (
    (profile.logoUrl?.trim().length ?? 0) > 0 &&
    (profile.coverImageUrl?.trim().length ?? 0) > 0
  );
}

function isPaymentComplete(profile: GorProfileData | null): boolean {
  if (!profile) {
    return false;
  }

  const hasQris = (profile.qrisImageUrl?.trim().length ?? 0) > 0;
  const hasBankAccount =
    (profile.bankName?.trim().length ?? 0) > 0 &&
    (profile.bankAccountNumber?.trim().length ?? 0) > 0;

  return hasQris || hasBankAccount;
}

export class QuickStartService {
  constructor(private readonly deps: QuickStartServiceDependencies) {}

  async getProgressForOwner(
    ownerId: string,
    profile: GorProfileData | null,
  ): Promise<QuickStartProgressData> {
    const courts = await this.deps.courtRepository.findAllByOwnerId(ownerId);
    const courtIds = courts.map((court) => court.id);

    const [
      activeOperatingHoursCount,
      activePriceRuleCount,
      bookingCount,
      pushSettings,
    ] = await Promise.all([
      courtIds.length === 0
        ? Promise.resolve(0)
        : this.deps.prisma.operatingHours.count({
            where: {
              courtId: { in: courtIds },
              isActive: true,
            },
          }),
      courtIds.length === 0
        ? Promise.resolve(0)
        : this.deps.prisma.priceRule.count({
            where: {
              courtId: { in: courtIds },
              isActive: true,
            },
          }),
      this.deps.prisma.booking.count({
        where: {
          court: {
            gor: {
              ownerId,
            },
          },
        },
      }),
      this.deps.pushSettingsRepository.getOrCreate(ownerId),
    ]);

    const completionByStep: Record<QuickStartStepId, boolean> = {
      [QUICK_START_STEP_ID.PROFILE]: isProfileComplete(profile),
      [QUICK_START_STEP_ID.MEDIA]: isMediaComplete(profile),
      [QUICK_START_STEP_ID.COURTS]: courts.length > 0,
      [QUICK_START_STEP_ID.OPERATING_HOURS]: activeOperatingHoursCount > 0,
      [QUICK_START_STEP_ID.PRICING]: activePriceRuleCount > 0,
      [QUICK_START_STEP_ID.PAYMENT]: isPaymentComplete(profile),
      [QUICK_START_STEP_ID.FIRST_BOOKING]: bookingCount > 0,
      [QUICK_START_STEP_ID.NOTIFICATIONS]: pushSettings.enabled,
    };

    const steps: QuickStartStepStatus[] = Object.values(
      QUICK_START_STEP_ID,
    ).map((id) => ({
      id,
      completed: completionByStep[id],
    }));

    const completedCount = steps.filter((step) => step.completed).length;
    const totalCount = steps.length;
    const percent =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return {
      steps,
      completedCount,
      totalCount,
      percent,
      allComplete: completedCount === totalCount,
      publicGorUrl: profile?.slug ? `/gor/${profile.slug}` : null,
    };
  }
}

export function createQuickStartService(
  dependencies: QuickStartServiceDependencies,
): QuickStartService {
  return new QuickStartService(dependencies);
}
