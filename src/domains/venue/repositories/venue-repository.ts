import type { VenueRecord } from "@/domains/venue/types";
import type { PrismaClient } from "@/generated/prisma/client";

export class VenueRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPublicVenueBySlug(slug: string): Promise<VenueRecord | null> {
    return this.prisma.gor.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        description: true,
        courts: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            sportType: true,
            isActive: true,
            displayOrder: true,
            operatingHours: {
              where: {
                isActive: true,
              },
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
        },
      },
    });
  }
}

export function createVenueRepository(prisma: PrismaClient): VenueRepository {
  return new VenueRepository(prisma);
}
