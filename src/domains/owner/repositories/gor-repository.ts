import type {
  GorProfileRecord,
  OwnerWithGorRecord,
  PublicGorRecord,
} from "@/domains/owner/types";
import type { PrismaClient } from "@/generated/prisma/client";

const gorProfileSelect = {
  id: true,
  name: true,
  slug: true,
  phone: true,
  email: true,
  address: true,
  city: true,
  province: true,
  description: true,
  logoUrl: true,
  coverImageUrl: true,
  timezone: true,
  currency: true,
  isActive: true,
} as const;

const publicGorSelect = {
  id: true,
  name: true,
  slug: true,
  address: true,
  city: true,
  description: true,
  logoUrl: true,
  coverImageUrl: true,
  isActive: true,
} as const;

export class GorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPublicGorBySlug(slug: string): Promise<PublicGorRecord | null> {
    return this.prisma.gor.findUnique({
      where: { slug },
      select: publicGorSelect,
    });
  }

  async findActivePublicGors(): Promise<PublicGorRecord[]> {
    return this.prisma.gor.findMany({
      where: { isActive: true },
      select: publicGorSelect,
      orderBy: { name: "asc" },
    });
  }

  async findGorIdByOwnerId(ownerId: string): Promise<string | null> {
    const gor = await this.prisma.gor.findUnique({
      where: { ownerId },
      select: { id: true },
    });

    return gor?.id ?? null;
  }

  async findOwnerWithGorByUserId(
    userId: string,
  ): Promise<OwnerWithGorRecord | null> {
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        gor: {
          select: gorProfileSelect,
        },
      },
    });

    if (!owner) {
      return null;
    }

    return {
      id: owner.id,
      userId: owner.userId,
      gor: owner.gor,
    };
  }

  async findSlugsMatchingPrefix(prefix: string): Promise<string[]> {
    const rows = await this.prisma.gor.findMany({
      where: {
        slug: {
          startsWith: prefix,
        },
      },
      select: {
        slug: true,
      },
    });

    return rows.map((row) => row.slug);
  }

  async createGorProfile(
    ownerId: string,
    data: Omit<GorProfileRecord, "id" | "currency" | "isActive"> & {
      currency?: string;
      isActive?: boolean;
    },
  ): Promise<GorProfileRecord> {
    return this.prisma.gor.create({
      data: {
        ownerId,
        name: data.name,
        slug: data.slug,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        province: data.province,
        description: data.description,
        logoUrl: data.logoUrl,
        coverImageUrl: data.coverImageUrl,
        timezone: data.timezone,
        currency: data.currency,
        isActive: data.isActive,
      },
      select: gorProfileSelect,
    });
  }

  async updateGorProfile(
    gorId: string,
    data: Omit<
      GorProfileRecord,
      "id" | "currency" | "isActive" | "slug" | "name"
    > & {
      name: string;
      slug: string;
    },
  ): Promise<GorProfileRecord> {
    return this.prisma.gor.update({
      where: { id: gorId },
      data: {
        name: data.name,
        slug: data.slug,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        province: data.province,
        description: data.description,
        logoUrl: data.logoUrl,
        coverImageUrl: data.coverImageUrl,
        timezone: data.timezone,
      },
      select: gorProfileSelect,
    });
  }
}

export function createGorRepository(prisma: PrismaClient): GorRepository {
  return new GorRepository(prisma);
}
