import type { PrismaClient } from "@/generated/prisma/client";

export type MatchingPriceRule = {
  price: number;
};

export type ActivePriceRule = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  price: number;
  isActive: boolean;
};

export type FindMatchingPriceRuleInput = {
  courtId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
};

export class PriceRuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMatchingRule(
    input: FindMatchingPriceRuleInput,
  ): Promise<MatchingPriceRule | null> {
    const rule = await this.prisma.priceRule.findFirst({
      where: {
        courtId: input.courtId,
        dayOfWeek: input.dayOfWeek,
        isActive: true,
        startMinute: {
          lte: input.startMinute,
        },
        endMinute: {
          gte: input.endMinute,
        },
      },
      orderBy: {
        startMinute: "asc",
      },
      select: {
        price: true,
      },
    });

    return rule;
  }

  async findActiveByCourtAndDay(
    courtId: string,
    dayOfWeek: number,
  ): Promise<ActivePriceRule[]> {
    return this.prisma.priceRule.findMany({
      where: {
        courtId,
        dayOfWeek,
        isActive: true,
      },
      select: {
        dayOfWeek: true,
        startMinute: true,
        endMinute: true,
        price: true,
        isActive: true,
      },
      orderBy: {
        startMinute: "asc",
      },
    });
  }

  async findActiveByCourt(courtId: string): Promise<ActivePriceRule[]> {
    return this.prisma.priceRule.findMany({
      where: {
        courtId,
        isActive: true,
      },
      select: {
        dayOfWeek: true,
        startMinute: true,
        endMinute: true,
        price: true,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
    });
  }
}

export function createPriceRuleRepository(
  prisma: PrismaClient,
): PriceRuleRepository {
  return new PriceRuleRepository(prisma);
}
