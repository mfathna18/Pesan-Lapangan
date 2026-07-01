import type { PrismaClient } from "@/generated/prisma/client";

export class OwnerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findIdByUserId(userId: string): Promise<string | null> {
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
      select: { id: true },
    });

    return owner?.id ?? null;
  }

  async createForUserId(userId: string): Promise<string> {
    const owner = await this.prisma.owner.create({
      data: { userId },
      select: { id: true },
    });

    return owner.id;
  }
}

export function createOwnerRepository(prisma: PrismaClient): OwnerRepository {
  return new OwnerRepository(prisma);
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function ensureOwnerForUserId(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  const repository = createOwnerRepository(prisma);

  const existingOwnerId = await repository.findIdByUserId(userId);

  if (existingOwnerId) {
    return;
  }

  try {
    await repository.createForUserId(userId);
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      return;
    }

    throw error;
  }
}
