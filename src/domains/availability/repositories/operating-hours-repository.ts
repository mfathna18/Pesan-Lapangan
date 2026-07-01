import type { PrismaClient } from "@/generated/prisma/client";
import type { OperatingHoursRecord } from "@/domains/availability/types";

const operatingHoursSelect = {
  dayOfWeek: true,
  startMinute: true,
  endMinute: true,
  isActive: true,
} as const;

export type ReplaceOperatingHoursInput = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  isActive: boolean;
};

export class OperatingHoursRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveByCourtAndDay(
    courtId: string,
    dayOfWeek: number,
  ): Promise<OperatingHoursRecord[]> {
    return this.prisma.operatingHours.findMany({
      where: {
        courtId,
        dayOfWeek,
        isActive: true,
      },
      select: operatingHoursSelect,
      orderBy: {
        startMinute: "asc",
      },
    });
  }

  async findByCourt(courtId: string): Promise<OperatingHoursRecord[]> {
    return this.prisma.operatingHours.findMany({
      where: { courtId },
      select: operatingHoursSelect,
      orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
    });
  }

  async replaceForCourt(
    courtId: string,
    windows: ReplaceOperatingHoursInput[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.operatingHours.deleteMany({
        where: { courtId },
      }),
      ...(windows.length > 0
        ? [
            this.prisma.operatingHours.createMany({
              data: windows.map((window) => ({
                courtId,
                dayOfWeek: window.dayOfWeek,
                startMinute: window.startMinute,
                endMinute: window.endMinute,
                isActive: window.isActive,
              })),
            }),
          ]
        : []),
    ]);
  }

  async findActiveByCourt(courtId: string): Promise<OperatingHoursRecord[]> {
    return this.prisma.operatingHours.findMany({
      where: {
        courtId,
        isActive: true,
      },
      select: operatingHoursSelect,
      orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
    });
  }
}

export function createOperatingHoursRepository(
  prisma: PrismaClient,
): OperatingHoursRepository {
  return new OperatingHoursRepository(prisma);
}
