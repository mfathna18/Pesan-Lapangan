import type { PrismaClient } from "@/generated/prisma/client";

export type MatchingPriceRule = {
  price: number;
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
}

export function createPriceRuleRepository(
  prisma: PrismaClient,
): PriceRuleRepository {
  return new PriceRuleRepository(prisma);
}
