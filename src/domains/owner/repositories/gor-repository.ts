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
  coverImages: true,
  timezone: true,
  currency: true,
  isActive: true,
  bankName: true,
  bankAccountNumber: true,
  bankAccountHolder: true,
  qrisImageUrl: true,
} as const;

const publicGorSelect = {
  id: true,
  name: true,
  slug: true,
  address: true,
  city: true,
  description: true,
  logoUrl: true,
  coverImages: true,
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
    data: Omit<GorProfileRecord, "id"> & {
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
        coverImages: data.coverImages,
        timezone: data.timezone,
        currency: data.currency ?? "IDR",
        isActive: data.isActive ?? true,
        bankName: data.bankName,
        bankAccountNumber: data.bankAccountNumber,
        bankAccountHolder: data.bankAccountHolder,
        qrisImageUrl: data.qrisImageUrl,
      },
      select: gorProfileSelect,
    });
  }

  async updateGorProfile(
    gorId: string,
    data: {
      name: string;
      slug: string;
      phone: string | null;
      email: string | null;
      address: string;
      city: string;
      province: string;
      description: string | null;
      timezone: string;
      bankName: string | null;
      bankAccountNumber: string | null;
      bankAccountHolder: string | null;
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
        timezone: data.timezone,
        bankName: data.bankName,
        bankAccountNumber: data.bankAccountNumber,
        bankAccountHolder: data.bankAccountHolder,
      },
      select: gorProfileSelect,
    });
  }

  async updateGorLogo(gorId: string, logoUrl: string | null): Promise<void> {
    await this.prisma.gor.update({
      where: { id: gorId },
      data: { logoUrl },
    });
  }

  async updateGorQris(
    gorId: string,
    qrisImageUrl: string | null,
  ): Promise<void> {
    await this.prisma.gor.update({
      where: { id: gorId },
      data: { qrisImageUrl },
    });
  }

  async updateGorCoverImages(
    gorId: string,
    coverImages: string[],
  ): Promise<void> {
    await this.prisma.gor.update({
      where: { id: gorId },
      data: { coverImages },
    });
  }
}

export function createGorRepository(prisma: PrismaClient): GorRepository {
  return new GorRepository(prisma);
}
