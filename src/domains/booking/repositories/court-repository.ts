import type { PrismaClient } from "@/generated/prisma/client";

export type CourtForBooking = {
  id: string;
  name: string;
  sportType: string;
  isActive: boolean;
  gor: {
    id: string;
  };
};

export type CourtOption = {
  id: string;
  name: string;
  sportType: string;
};

export class CourtRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveCourts(): Promise<CourtOption[]> {
    return this.prisma.court.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sportType: true,
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  async findActiveCourtWithGor(
    courtId: string,
  ): Promise<CourtForBooking | null> {
    const court = await this.prisma.court.findFirst({
      where: {
        id: courtId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sportType: true,
        isActive: true,
        gor: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!court?.gor) {
      return null;
    }

    return {
      id: court.id,
      name: court.name,
      sportType: court.sportType,
      isActive: court.isActive,
      gor: court.gor,
    };
  }
}

export function createCourtRepository(prisma: PrismaClient): CourtRepository {
  return new CourtRepository(prisma);
}
