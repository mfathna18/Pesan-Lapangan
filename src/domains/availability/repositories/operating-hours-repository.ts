import type { PrismaClient } from "@/generated/prisma/client";
import type { OperatingHoursRecord } from "@/domains/availability/types";

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
      select: {
        dayOfWeek: true,
        startMinute: true,
        endMinute: true,
        isActive: true,
      },
      orderBy: {
        startMinute: "asc",
      },
    });
  }

  async findActiveByCourt(courtId: string): Promise<OperatingHoursRecord[]> {
    return this.prisma.operatingHours.findMany({
      where: {
        courtId,
        isActive: true,
      },
      select: {
        dayOfWeek: true,
        startMinute: true,
        endMinute: true,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
    });
  }
}

export function createOperatingHoursRepository(
  prisma: PrismaClient,
): OperatingHoursRepository {
  return new OperatingHoursRepository(prisma);
}
