import { OWNER_ROLE } from "@/domains/owner/constants";
import { ensureOwnerForUserId } from "@/domains/owner/repositories/owner-repository";
import { prisma } from "@/lib/db/prisma";

type ProvisionableUser = {
  id: string;
  role?: string | null;
};

export async function provisionOwnerAfterUserSignUp(
  user: ProvisionableUser | null | undefined,
): Promise<void> {
  if (!user?.id) {
    return;
  }

  if (user.role !== OWNER_ROLE) {
    return;
  }

  await ensureOwnerForUserId(prisma, user.id);
}
