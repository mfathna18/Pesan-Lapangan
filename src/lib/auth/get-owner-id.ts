import { OwnerNotFoundError } from "@/domains/owner/errors";
import { prisma } from "@/lib/db/prisma";

export async function getOwnerIdByUserId(
  userId: string,
): Promise<string | null> {
  const owner = await prisma.owner.findUnique({
    where: { userId },
    select: { id: true },
  });

  return owner?.id ?? null;
}

export async function requireOwnerId(userId: string): Promise<string> {
  const ownerId = await getOwnerIdByUserId(userId);

  if (!ownerId) {
    throw new OwnerNotFoundError();
  }

  return ownerId;
}
