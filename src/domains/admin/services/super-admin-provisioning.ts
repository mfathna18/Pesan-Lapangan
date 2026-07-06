import {
  FIRST_SUPER_ADMIN_EMAIL,
  USER_ROLE,
  type UserRole,
} from "@/domains/auth/constants";
import { prisma } from "@/lib/db/prisma";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function ensureSuperAdminRole(
  userId: string,
  email: string,
): Promise<UserRole> {
  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail !== FIRST_SUPER_ADMIN_EMAIL) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role ?? USER_ROLE.OWNER;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: USER_ROLE.SUPER_ADMIN },
    select: { role: true },
  });

  return updated.role;
}
