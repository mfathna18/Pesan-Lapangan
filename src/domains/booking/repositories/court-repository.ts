import type { PublicCourtDetailRecord } from "@/domains/booking/types";
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

export type PublicCourtRecord = {
  id: string;
  name: string;
  sportType: string;
  isActive: boolean;
  displayOrder: number;
  operatingHours: {
    dayOfWeek: number;
    startMinute: number;
    endMinute: number;
    isActive: boolean;
  }[];
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

  async findActiveCourtsByOwnerId(ownerId: string): Promise<CourtOption[]> {
    return this.prisma.court.findMany({
      where: {
        isActive: true,
        gor: {
          ownerId,
        },
      },
      select: {
        id: true,
        name: true,
        sportType: true,
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  async isCourtOwnedByOwner(
    courtId: string,
    ownerId: string,
  ): Promise<boolean> {
    const court = await this.prisma.court.findFirst({
      where: {
        id: courtId,
        gor: {
          ownerId,
        },
      },
      select: { id: true },
    });

    return court !== null;
  }

  async findPublicCourtsByGorId(gorId: string): Promise<PublicCourtRecord[]> {
    return this.prisma.court.findMany({
      where: { gorId },
      select: {
        id: true,
        name: true,
        sportType: true,
        isActive: true,
        displayOrder: true,
        operatingHours: {
          where: { isActive: true },
          select: {
            dayOfWeek: true,
            startMinute: true,
            endMinute: true,
            isActive: true,
          },
          orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  async findPublicCourtDetailByGorSlug(
    courtId: string,
    gorSlug: string,
  ): Promise<PublicCourtDetailRecord | null> {
    const court = await this.prisma.court.findFirst({
      where: {
        id: courtId,
        isActive: true,
        gor: {
          slug: gorSlug,
          isActive: true,
        },
      },
      select: {
        id: true,
        name: true,
        sportType: true,
        description: true,
        imageUrls: true,
        facilities: true,
        gor: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!court?.gor) {
      return null;
    }

    return court;
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
