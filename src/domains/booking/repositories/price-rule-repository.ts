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

export type OwnerPriceRuleRecord = {
  id: string;
  courtId: string;
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

const priceRuleSelect = {
  id: true,
  courtId: true,
  dayOfWeek: true,
  startMinute: true,
  endMinute: true,
  price: true,
  isActive: true,
} as const;

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

  async findAllByCourt(courtId: string): Promise<OwnerPriceRuleRecord[]> {
    return this.prisma.priceRule.findMany({
      where: { courtId },
      select: priceRuleSelect,
      orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
    });
  }

  async findByIdForCourt(
    priceRuleId: string,
    courtId: string,
  ): Promise<OwnerPriceRuleRecord | null> {
    return this.prisma.priceRule.findFirst({
      where: {
        id: priceRuleId,
        courtId,
      },
      select: priceRuleSelect,
    });
  }

  async createForCourt(
    courtId: string,
    data: {
      dayOfWeek: number;
      startMinute: number;
      endMinute: number;
      price: number;
      isActive: boolean;
    },
  ): Promise<OwnerPriceRuleRecord> {
    return this.prisma.priceRule.create({
      data: {
        courtId,
        dayOfWeek: data.dayOfWeek,
        startMinute: data.startMinute,
        endMinute: data.endMinute,
        price: data.price,
        isActive: data.isActive,
      },
      select: priceRuleSelect,
    });
  }

  async updateForCourt(
    priceRuleId: string,
    courtId: string,
    data: {
      dayOfWeek: number;
      startMinute: number;
      endMinute: number;
      price: number;
      isActive: boolean;
    },
  ): Promise<OwnerPriceRuleRecord | null> {
    const existing = await this.findByIdForCourt(priceRuleId, courtId);

    if (!existing) {
      return null;
    }

    return this.prisma.priceRule.update({
      where: { id: priceRuleId },
      data: {
        dayOfWeek: data.dayOfWeek,
        startMinute: data.startMinute,
        endMinute: data.endMinute,
        price: data.price,
        isActive: data.isActive,
      },
      select: priceRuleSelect,
    });
  }

  async setActiveForCourt(
    priceRuleId: string,
    courtId: string,
    isActive: boolean,
  ): Promise<OwnerPriceRuleRecord | null> {
    const existing = await this.findByIdForCourt(priceRuleId, courtId);

    if (!existing) {
      return null;
    }

    return this.prisma.priceRule.update({
      where: { id: priceRuleId },
      data: { isActive },
      select: priceRuleSelect,
    });
  }

  async deleteForCourt(priceRuleId: string, courtId: string): Promise<boolean> {
    const existing = await this.findByIdForCourt(priceRuleId, courtId);

    if (!existing) {
      return false;
    }

    await this.prisma.priceRule.delete({
      where: { id: priceRuleId },
    });

    return true;
  }
}

export function createPriceRuleRepository(
  prisma: PrismaClient,
): PriceRuleRepository {
  return new PriceRuleRepository(prisma);
}
