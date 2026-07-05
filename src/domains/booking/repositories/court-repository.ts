import type { PublicCourtDetailRecord } from "@/domains/booking/types";
import type { PrismaClient, SportType } from "@/generated/prisma/client";

export type CourtForBooking = {
  id: string;
  name: string;
  sportType: string;
  isActive: boolean;
  gor: {
    name: string;
    timezone: string;
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

export type OwnerCourtRecord = {
  id: string;
  name: string;
  sportType: SportType;
  isActive: boolean;
  displayOrder: number;
};

const ownerCourtSelect = {
  id: true,
  name: true,
  sportType: true,
  isActive: true,
  displayOrder: true,
} as const;

export class CourtRepository {
  constructor(private readonly prisma: PrismaClient) {}

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

  async findAllByOwnerId(ownerId: string): Promise<OwnerCourtRecord[]> {
    return this.prisma.court.findMany({
      where: {
        gor: {
          ownerId,
        },
      },
      select: ownerCourtSelect,
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    return this.prisma.court.count({
      where: {
        gor: {
          ownerId,
        },
      },
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

  async findByIdForOwner(
    courtId: string,
    ownerId: string,
  ): Promise<OwnerCourtRecord | null> {
    return this.prisma.court.findFirst({
      where: {
        id: courtId,
        gor: {
          ownerId,
        },
      },
      select: ownerCourtSelect,
    });
  }

  async getMaxDisplayOrderForGor(gorId: string): Promise<number> {
    const result = await this.prisma.court.aggregate({
      where: { gorId },
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? -1;
  }

  async createForGor(
    gorId: string,
    data: {
      name: string;
      sportType: SportType;
      isActive: boolean;
      displayOrder: number;
    },
  ): Promise<OwnerCourtRecord> {
    return this.prisma.court.create({
      data: {
        gorId,
        name: data.name,
        sportType: data.sportType,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      },
      select: ownerCourtSelect,
    });
  }

  async updateForOwner(
    courtId: string,
    ownerId: string,
    data: {
      name: string;
      sportType: SportType;
      isActive: boolean;
    },
  ): Promise<OwnerCourtRecord | null> {
    const owned = await this.isCourtOwnedByOwner(courtId, ownerId);

    if (!owned) {
      return null;
    }

    return this.prisma.court.update({
      where: { id: courtId },
      data: {
        name: data.name,
        sportType: data.sportType,
        isActive: data.isActive,
      },
      select: ownerCourtSelect,
    });
  }

  async setActiveForOwner(
    courtId: string,
    ownerId: string,
    isActive: boolean,
  ): Promise<OwnerCourtRecord | null> {
    const owned = await this.isCourtOwnedByOwner(courtId, ownerId);

    if (!owned) {
      return null;
    }

    return this.prisma.court.update({
      where: { id: courtId },
      data: { isActive },
      select: ownerCourtSelect,
    });
  }

  async deleteForOwner(courtId: string, ownerId: string): Promise<boolean> {
    const owned = await this.isCourtOwnedByOwner(courtId, ownerId);

    if (!owned) {
      return false;
    }

    await this.prisma.court.delete({
      where: { id: courtId },
    });

    return true;
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
            name: true,
            timezone: true,
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
